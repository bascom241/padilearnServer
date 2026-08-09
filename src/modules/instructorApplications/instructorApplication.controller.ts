import type { Response, NextFunction } from "express";
import type { AuthorizedRequest } from "../../middlewares/authorize.middleware.js";
import {
  applyForInstructor,
  getMyApplication,
  listApplications,
  approveApplication,
  rejectApplication,
} from "./instructorApplication.service.js";

export const handleApplyForInstructor = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const application = await applyForInstructor(req.currentUser!.id, req.body);
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

export const handleGetMyApplication = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const application = await getMyApplication(req.currentUser!.id);
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

export const handleListApplications = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applications = await listApplications(req.query.status as string | undefined);
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

export const handleApproveApplication = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const application = await approveApplication(
      req.params.applicationId as string,
      req.currentUser!.id,
    );
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

export const handleRejectApplication = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const application = await rejectApplication(
      req.params.applicationId as string,
      req.currentUser!.id,
    );
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
