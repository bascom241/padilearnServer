import type { CreateCourseRequest } from "./dtos/course/CreateCourseRequest.dto.js";
import type { UpdateCourseRequest } from "./dtos/course/UpdateCourseRequest.dto.js";
import courseModel from "./course.model.js";
import moduleModel from "../module/module.model.js";
import lessonModel from "../lesson/lesson.model.js";
import videoModel from "../video/video.model.js";
import { AppError } from "../../../error/AppError.js";
import { deleteVideosByLessonIds } from "../video/video.service.js";
import { hasActiveEnrollment } from "../../enrollments/enrollment.service.js";
import { CourseStatus } from "./types/course.types.js";

export interface ListCoursesQuery {
  category?: string;
  level?: string;
  search?: string;
  instructor?: string;
  isPublished?: string;
  status?: string;
  page?: string;
  limit?: string;
}

// This is create course end point. 
export const createCourse = async (
  data: CreateCourseRequest,
  instructorId: string,
) => {
  const { level, ...required } = data;
  const course = await courseModel.create({
    ...required,
    instructor: instructorId,
    ...(level !== undefined && { level }),
  });
  return course;
};

export const listCourses = async (query: ListCoursesQuery) => {
  const filter: Record<string, unknown> = {};

  if (query.category) filter.category = query.category;
  if (query.level) filter.level = query.level;
  if (query.instructor) filter.instructor = query.instructor;
  if (query.isPublished !== undefined) filter.isPublished = query.isPublished === "true";
  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.title = { $regex: query.search, $options: "i" };
  }

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const [courses, total] = await Promise.all([
    courseModel
      .find(filter)
      .populate("instructor", "fullName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    courseModel.countDocuments(filter),
  ]);

  return {
    courses,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

// Full course detail, nested course -> modules -> lessons -> video,
// matching the mobile course-detail screen's syllabus/accordion shape.
// currentUserId is optional (the route allows anonymous browsing) — when
// present, non-preview lessons are marked isLocked unless the user owns the
// course, is an admin, or is actively enrolled.
export const getCourseById = async (courseId: string, currentUserId?: string) => {
  const course = await courseModel.findById(courseId).populate("instructor", "fullName email");

  if (!course) {
    throw new AppError("course not found", 404);
  }

  let hasFullAccess = false;
  if (currentUserId) {
    const instructorId = (course.instructor as unknown as { _id: { toString(): string } })._id.toString();
    hasFullAccess =
      instructorId === currentUserId || (await hasActiveEnrollment(currentUserId, courseId));
  }

  const modules = await moduleModel.find({ course: courseId }).sort({ order: 1 });
  const moduleIds = modules.map((m) => m._id);

  const lessons = await lessonModel.find({ module: { $in: moduleIds } }).sort({ order: 1 });
  const lessonIds = lessons.map((l) => l._id);

  const videos = await videoModel.find({ lesson: { $in: lessonIds } });
  const videoByLesson = new Map(videos.map((v) => [v.lesson.toString(), v]));

  const lessonsByModule = new Map<string, typeof lessons>();
  for (const lesson of lessons) {
    const key = lesson.module.toString();
    if (!lessonsByModule.has(key)) lessonsByModule.set(key, []);
    lessonsByModule.get(key)!.push(lesson);
  }

  const moduleDtos = modules.map((module) => {
    const moduleLessons = lessonsByModule.get(module._id.toString()) ?? [];
    return {
      id: module._id,
      title: module.title,
      description: module.description,
      order: module.order,
      duration: module.duration ?? 0,
      lessonCount: moduleLessons.length,
      lessons: moduleLessons.map((lesson) => {
        const video = videoByLesson.get(lesson._id.toString());
        const isLocked = !lesson.isPreview && !hasFullAccess;
        return {
          id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          isPreview: lesson.isPreview,
          isLocked,
          duration: video?.duration ?? 0,
          video: video
            ? { id: video._id, status: video.status, duration: video.duration }
            : null,
        };
      }),
    };
  });

  const totalLessons = lessons.length;
  const totalDuration = moduleDtos.reduce((sum, m) => sum + (m.duration ?? 0), 0);

  return {
    id: course._id,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    category: course.category,
    level: course.level,
    price: course.price,
    isPublished: course.isPublished,
    status: course.status,
    instructor: course.instructor,
    totalLessons,
    totalDuration,
    isEnrolled: hasFullAccess,
    modules: moduleDtos,
  };
};

const findCourseOrThrow = async (courseId: string) => {
  const course = await courseModel.findById(courseId);
  if (!course) {
    throw new AppError("course not found", 404);
  }
  return course;
};

const assertOwnerOrAdmin = (
  course: { instructor: { toString(): string } },
  currentUser: { id: string; role: string },
) => {
  if (currentUser.role !== "admin" && course.instructor.toString() !== currentUser.id) {
    throw new AppError("You do not have permission to modify this course", 403);
  }
};

export const updateCourse = async (
  courseId: string,
  data: UpdateCourseRequest,
  currentUser: { id: string; role: string },
) => {
  const course = await findCourseOrThrow(courseId);
  assertOwnerOrAdmin(course, currentUser);

  Object.assign(course, data);
  await course.save();
  return course;
};

// Instructor (owner) moves their own draft/rejected course into the admin's
// review queue. Cannot be called on a course that's already pending/published.
export const submitCourseForReview = async (
  courseId: string,
  currentUser: { id: string; role: string },
) => {
  const course = await findCourseOrThrow(courseId);
  assertOwnerOrAdmin(course, currentUser);

  if (course.status !== CourseStatus.DRAFT && course.status !== CourseStatus.REJECTED) {
    throw new AppError("only a draft or rejected course can be submitted for review", 400);
  }

  course.status = CourseStatus.PENDING;
  await course.save();
  return course;
};

// Admin-only: the only path that ever flips isPublished to true.
export const approveCourse = async (
  courseId: string,
  adminId: string,
) => {
  const course = await findCourseOrThrow(courseId);

  if (course.status !== CourseStatus.PENDING) {
    throw new AppError("only a pending course can be approved", 400);
  }

  course.status = CourseStatus.PUBLISHED;
  course.isPublished = true;
  course.set("reviewedBy", adminId);
  course.reviewedAt = new Date();
  await course.save();
  return course;
};

export const rejectCourse = async (
  courseId: string,
  adminId: string,
  reason?: string,
) => {
  const course = await findCourseOrThrow(courseId);

  if (course.status !== CourseStatus.PENDING) {
    throw new AppError("only a pending course can be rejected", 400);
  }

  course.status = CourseStatus.REJECTED;
  course.isPublished = false;
  course.set("reviewedBy", adminId);
  course.reviewedAt = new Date();
  if (reason !== undefined) {
    course.rejectionReason = reason;
  }
  await course.save();
  return course;
};

export const deleteCourse = async (
  courseId: string,
  currentUser: { id: string; role: string },
) => {
  const course = await findCourseOrThrow(courseId);
  assertOwnerOrAdmin(course, currentUser);

  const modules = await moduleModel.find({ course: courseId });
  const moduleIds = modules.map((m) => m._id);
  const lessons = await lessonModel.find({ module: { $in: moduleIds } });
  const lessonIds = lessons.map((l) => l._id);

  await deleteVideosByLessonIds(lessonIds.map((id) => id.toString()));
  await lessonModel.deleteMany({ module: { $in: moduleIds } });
  await moduleModel.deleteMany({ course: courseId });
  await course.deleteOne();
};
