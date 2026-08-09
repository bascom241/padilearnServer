import type { CreateModuleRequest } from "../course/dtos/module/CreateModuleRequest.dto.js";
import type { UpdateModuleRequest } from "../course/dtos/module/UpdateModuleRequest.dto.js";
import moduleModel from "./module.model.js";
import courseModel from "../course/course.model.js";
import lessonModel from "../lesson/lesson.model.js";
import videoModel from "../video/video.model.js";
import { AppError } from "../../../error/AppError.js";
import { deleteVideosByLessonIds } from "../video/video.service.js";

const assertCourseOwnerOrAdmin = async (
  courseId: string,
  currentUser: { id: string; role: string },
) => {
  const course = await courseModel.findById(courseId);
  if (!course) {
    throw new AppError("course not found", 404);
  }
  if (currentUser.role !== "admin" && course.instructor.toString() !== currentUser.id) {
    throw new AppError("You do not have permission to modify this course", 403);
  }
  return course;
};

export const createModule = async (
  courseId: string,
  data: CreateModuleRequest,
  currentUser: { id: string; role: string },
) => {
  await assertCourseOwnerOrAdmin(courseId, currentUser);

  const lastModule = await moduleModel
    .findOne({ course: courseId })
    .sort({ order: -1 });
  const order = (lastModule?.order ?? 0) + 1;

  return moduleModel.create({ ...data, course: courseId, order });
};

export const listModulesForCourse = async (courseId: string) => {
  return moduleModel.find({ course: courseId }).sort({ order: 1 });
};

export const findModuleOrThrow = async (moduleId: string) => {
  const module = await moduleModel.findById(moduleId);
  if (!module) {
    throw new AppError("module not found", 404);
  }
  return module;
};

export const getModuleById = async (moduleId: string) => {
  const module = await findModuleOrThrow(moduleId);
  const lessons = await lessonModel.find({ module: moduleId }).sort({ order: 1 });
  return { ...module.toObject(), lessons };
};

export const updateModule = async (
  moduleId: string,
  data: UpdateModuleRequest,
  currentUser: { id: string; role: string },
) => {
  const module = await findModuleOrThrow(moduleId);
  await assertCourseOwnerOrAdmin(module.course.toString(), currentUser);

  Object.assign(module, data);
  await module.save();
  return module;
};

export const deleteModule = async (
  moduleId: string,
  currentUser: { id: string; role: string },
) => {
  const module = await findModuleOrThrow(moduleId);
  await assertCourseOwnerOrAdmin(module.course.toString(), currentUser);

  const lessons = await lessonModel.find({ module: moduleId });
  const lessonIds = lessons.map((l) => l._id.toString());

  await deleteVideosByLessonIds(lessonIds);
  await lessonModel.deleteMany({ module: moduleId });
  await module.deleteOne();
};

// Recomputed whenever a lesson's video finishes processing, so module.duration
// always reflects the sum of its lessons' actual video lengths.
export const recomputeModuleDuration = async (moduleId: string) => {
  const lessons = await lessonModel.find({ module: moduleId });
  const lessonIds = lessons.map((l) => l._id);
  const videos = await videoModel.find({ lesson: { $in: lessonIds } });
  const duration = videos.reduce((sum, v) => sum + (v.duration ?? 0), 0);

  await moduleModel.findByIdAndUpdate(moduleId, { duration });
};
