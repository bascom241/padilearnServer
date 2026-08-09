import type { CreateLessonRequest } from "../course/dtos/lesson/createLessonRequest.dto.js";
import type { UpdateLessonRequest } from "../course/dtos/lesson/UpdateLessonRequest.dto.js";
import lessonModel from "./lesson.model.js";
import moduleModel from "../module/module.model.js";
import courseModel from "../course/course.model.js";
import videoModel from "../video/video.model.js";
import userModel from "../../user/user.model.js";
import lessonProgressModel from "./lessonProgress.model.js";
import { AppError } from "../../../error/AppError.js";
import { deleteVideosByLessonIds } from "../video/video.service.js";
import { hasActiveEnrollment } from "../../enrollments/enrollment.service.js";

export const MAX_LESSONS_PER_MODULE = 5;

const assertModuleOwnerOrAdmin = async (
  moduleId: string,
  currentUser: { id: string; role: string },
) => {
  const module = await moduleModel.findById(moduleId);
  if (!module) {
    throw new AppError("module not found", 404);
  }

  const course = await courseModel.findById(module.course);
  if (!course) {
    throw new AppError("course not found", 404);
  }

  if (currentUser.role !== "admin" && course.instructor.toString() !== currentUser.id) {
    throw new AppError("You do not have permission to modify this module", 403);
  }

  return module;
};

export const createLesson = async (
  moduleId: string,
  data: CreateLessonRequest,
  currentUser: { id: string; role: string },
) => {
  const module = await assertModuleOwnerOrAdmin(moduleId, currentUser);

  const lessonCount = await lessonModel.countDocuments({ module: moduleId });
  if (lessonCount >= MAX_LESSONS_PER_MODULE) {
    throw new AppError(
      `A module can have at most ${MAX_LESSONS_PER_MODULE} lessons`,
      400,
    );
  }

  const lesson = await lessonModel.create({
    title: data.title,
    description: data.description,
    ...(data.isPreview !== undefined && { isPreview: data.isPreview }),
    module: moduleId,
    order: lessonCount + 1,
  });

  module.lessonCount = lessonCount + 1;
  await module.save();

  return lesson;
};

export const listLessonsForModule = async (moduleId: string) => {
  const lessons = await lessonModel.find({ module: moduleId }).sort({ order: 1 });
  const videos = await videoModel.find({ lesson: { $in: lessons.map((l) => l._id) } });
  const videoByLesson = new Map(videos.map((v) => [String(v.lesson), v]));

  return lessons.map((lesson) => ({
    ...lesson.toObject(),
    video: videoByLesson.get(lesson._id.toString()) ?? null,
  }));
};

export const findLessonOrThrow = async (lessonId: string) => {
  const lesson = await lessonModel.findById(lessonId);
  if (!lesson) {
    throw new AppError("lesson not found", 404);
  }
  return lesson;
};

// Preview lessons are open to everyone; anything else requires the requester
// to be enrolled in the course, or to be the course's instructor/an admin.
// Used both here and by the video module before handing out a playback URL.
export const assertLessonAccessible = async (
  lessonId: string,
  currentUserId?: string,
) => {
  const lesson = await findLessonOrThrow(lessonId);
  if (lesson.isPreview) {
    return lesson;
  }

  if (!currentUserId) {
    throw new AppError("Sign in and enroll in this course to access this lesson", 401);
  }

  const module = await moduleModel.findById(lesson.module);
  if (!module) {
    throw new AppError("module not found", 404);
  }
  const course = await courseModel.findById(module.course);
  if (!course) {
    throw new AppError("course not found", 404);
  }

  if (course.instructor.toString() === currentUserId) {
    return lesson;
  }

  const user = await userModel.findById(currentUserId);
  if (user?.role === "admin") {
    return lesson;
  }

  const enrolled = await hasActiveEnrollment(currentUserId, course._id.toString());
  if (!enrolled) {
    throw new AppError("Enroll in this course to access this lesson", 403);
  }

  return lesson;
};

export const getLessonById = async (lessonId: string, currentUserId?: string) => {
  const lesson = await assertLessonAccessible(lessonId, currentUserId);
  const video = await videoModel.findOne({ lesson: lessonId });
  return { ...lesson.toObject(), video };
};

export const updateLesson = async (
  lessonId: string,
  data: UpdateLessonRequest,
  currentUser: { id: string; role: string },
) => {
  const lesson = await findLessonOrThrow(lessonId);
  await assertModuleOwnerOrAdmin(lesson.module.toString(), currentUser);

  Object.assign(lesson, data);
  await lesson.save();
  return lesson;
};

export const deleteLesson = async (
  lessonId: string,
  currentUser: { id: string; role: string },
) => {
  const lesson = await findLessonOrThrow(lessonId);
  const module = await assertModuleOwnerOrAdmin(lesson.module.toString(), currentUser);

  await deleteVideosByLessonIds([lessonId]);
  await lesson.deleteOne();

  const remaining = await lessonModel.find({ module: module._id }).sort({ order: 1 });
  await Promise.all(
    remaining.map((l, index) =>
      lessonModel.findByIdAndUpdate(l._id, { order: index + 1 }),
    ),
  );
  module.lessonCount = remaining.length;
  await module.save();
};

// Used by the video module before creating/replacing/deleting a lesson's video.
export const assertLessonOwnerOrAdmin = async (
  lessonId: string,
  currentUser: { id: string; role: string },
) => {
  const lesson = await findLessonOrThrow(lessonId);
  await assertModuleOwnerOrAdmin(lesson.module.toString(), currentUser);
  return lesson;
};

// Marks a lesson watched/complete for the student — idempotent, and feeds the
// profile's "courses completed" / "learning hours" stats.
export const markLessonComplete = async (lessonId: string, studentId: string) => {
  const lesson = await assertLessonAccessible(lessonId, studentId);
  const module = await moduleModel.findById(lesson.module);
  if (!module) {
    throw new AppError("module not found", 404);
  }

  await lessonProgressModel.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    { student: studentId, lesson: lessonId, course: module.course, completedAt: new Date() },
    { upsert: true, new: true },
  );
};
