import type { Response, NextFunction, Request } from "express";
import type { AuthorizedRequest } from "../../middlewares/authorize.middleware.js";
import type { ValidateRequestType } from "../../middlewares/authenticate.middleware.js";
import {
  initializeEnrollment,
  verifyEnrollment,
  getMyEnrollments,
  getEnrollmentStatusForCourse,
  handlePaystackWebhookEvent,
} from "./enrollment.service.js";
import { verifyPaystackSignature } from "../../config/paystack.js";

export const handleInitializeEnrollment = async (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.user as { id: string }).id;
    const result = await initializeEnrollment(req.body.courseId, userId);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const handleVerifyEnrollment = async (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.user as { id: string }).id;
    const enrollment = await verifyEnrollment(req.params.reference as string, userId);
    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

export const handleGetMyEnrollments = async (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.user as { id: string }).id;
    const enrollments = await getMyEnrollments(userId);
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

export const handleGetEnrollmentStatus = async (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.user as { id: string }).id;
    const status = await getEnrollmentStatusForCourse(userId, req.params.courseId as string);
    res.status(200).json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

// Public endpoint Paystack calls on payment events — verified via HMAC over
// the raw body, not a user JWT.
export const handlePaystackWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawBody = req.body as unknown as string;
    const signature = req.headers["x-paystack-signature"] as string | undefined;

    if (!verifyPaystackSignature(rawBody, signature)) {
      res.status(401).json({ success: false, message: "invalid signature" });
      return;
    }

    await handlePaystackWebhookEvent(JSON.parse(rawBody));
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
