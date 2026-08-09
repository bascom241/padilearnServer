import type { Response, NextFunction } from "express";
import type { AuthorizedRequest } from "../../../middlewares/authorize.middleware.js";
import {
  createModule,
  listModulesForCourse,
  getModuleById,
  updateModule,
  deleteModule,
} from "./module.service.js";

export const handleCreateModule = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log(req.body)
    console.log(req.query)
    const module = await createModule(
      req.query.courseId as string,
      req.body,
      req.currentUser!,
    );
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    next(error);
  }
};

export const handleListModulesForCourse = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const modules = await listModulesForCourse(req.params.courseId as string);
    res.status(200).json({ success: true, data: modules });
  } catch (error) {
    next(error);
  }
};

export const handleGetModule = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const module = await getModuleById(req.params.moduleId as string);
    res.status(200).json({ success: true, data: module });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateModule = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const module = await updateModule(
      req.params.moduleId as string,
      req.body,
      req.currentUser!,
    );
    res.status(200).json({ success: true, data: module });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteModule = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteModule(req.params.moduleId as string, req.currentUser!);
    res.status(200).json({ success: true, message: "module deleted" });
  } catch (error) {
    next(error);
  }
};
