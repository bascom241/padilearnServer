import type { Response, NextFunction } from "express";
import type { AuthorizedRequest } from "../../../middlewares/authorize.middleware.js";
import type { ValidateRequestType } from "../../../middlewares/authenticate.middleware.js";
import {
  createLesson,
  listLessonsForModule,
  getLessonById,
  updateLesson,
  deleteLesson,
  markLessonComplete,
} from "./lesson.service.js";

export const handleCreateLesson = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lesson = await createLesson(
      req.params.moduleId as string,
      req.body,
      req.currentUser!,
    );
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

export const handleListLessonsForModule = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lessons = await listLessonsForModule(req.params.moduleId as string);
    res.status(200).json({ success: true, data: lessons });
  } catch (error) {
    next(error);
  }
};

export const handleGetLesson = async (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.user as { id: string } | undefined)?.id;
    const lesson = await getLessonById(req.params.lessonId as string, userId);
    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateLesson = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lesson = await updateLesson(
      req.params.lessonId as string,
      req.body,
      req.currentUser!,
    );
    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteLesson = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteLesson(req.params.lessonId as string, req.currentUser!);
    res.status(200).json({ success: true, message: "lesson deleted" });
  } catch (error) {
    next(error);
  }
};

export const handleMarkLessonComplete = async (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.user as { id: string }).id;
    await markLessonComplete(req.params.lessonId as string, userId);
    res.status(200).json({ success: true, message: "lesson marked complete" });
  } catch (error) {
    next(error);
  }
};
