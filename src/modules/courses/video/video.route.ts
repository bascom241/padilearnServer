import { Router } from "express";
import { validate } from "../../../middlewares/validate.middleware.js";
import { validateToken, attemptAuthenticate } from "../../../middlewares/authenticate.middleware.js";
import { requireRole } from "../../../middlewares/authorize.middleware.js";
import { UserRole } from "../../../types/user.types.js";
import { initiateVideoUploadSchema } from "./dtos/InitiateVideoUploadRequest.dto.js";
import {
  handleInitiateVideoUpload,
  handleGetLessonVideo,
  handleGetVideoPlayback,
  handleDeleteLessonVideo,
  handleBunnyVideoWebhook,
} from "./video.controller.js";

// Mounted at /api/v1/lessons/:lessonId/video
export const lessonVideoRouter = Router({ mergeParams: true });

lessonVideoRouter.get("/", attemptAuthenticate, handleGetLessonVideo);
lessonVideoRouter.get("/playback", attemptAuthenticate, handleGetVideoPlayback);
lessonVideoRouter.post(
  "/",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  validate(initiateVideoUploadSchema),
  handleInitiateVideoUpload,
);
lessonVideoRouter.delete(
  "/",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  handleDeleteLessonVideo,
);

// Mounted at /api/v1/videos — Bunny's fixed webhook callback URL (no lesson context).
export const videoWebhookRouter = Router();
videoWebhookRouter.post("/webhook", handleBunnyVideoWebhook);
