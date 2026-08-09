import type { Response, NextFunction } from "express";
import type { AuthorizedRequest } from "../../../middlewares/authorize.middleware.js";
import type { ValidateRequestType } from "../../../middlewares/authenticate.middleware.js";
import {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  submitCourseForReview,
  approveCourse,
  rejectCourse,
  deleteCourse,
} from "./course.service.js";

export const handleCreateCourse = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const course = await createCourse(req.body, req.currentUser!.id);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const handleListCourses = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await listCourses(req.query as Record<string, string>);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const handleGetCourse = async (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.user as { id: string } | undefined)?.id;
    const course = await getCourseById(req.params.courseId as string, userId);
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateCourse = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const course = await updateCourse(
      req.params.courseId as string,
      req.body,
      req.currentUser!,
    );
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const handleSubmitCourseForReview = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const course = await submitCourseForReview(req.params.courseId as string, req.currentUser!);
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const handleApproveCourse = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const course = await approveCourse(req.params.courseId as string, req.currentUser!.id);
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const handleRejectCourse = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const course = await rejectCourse(
      req.params.courseId as string,
      req.currentUser!.id,
      req.body?.reason,
    );
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteCourse = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteCourse(req.params.courseId as string, req.currentUser!);
    res.status(200).json({ success: true, message: "course deleted" });
  } catch (error) {
    next(error);
  }
};
