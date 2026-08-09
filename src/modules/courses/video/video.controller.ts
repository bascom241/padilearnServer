import type { Response, NextFunction } from "express";
import type { AuthorizedRequest } from "../../../middlewares/authorize.middleware.js";
import type { ValidateRequestType } from "../../../middlewares/authenticate.middleware.js";
import type { Request } from "express";
import {
  initiateLessonVideoUpload,
  getLessonVideoGated,
  deleteLessonVideo,
  getVideoPlaybackInfo,
  handleBunnyWebhook,
} from "./video.service.js";
import { assertLessonOwnerOrAdmin } from "../lesson/lesson.service.js";

export const handleInitiateVideoUpload = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lessonId = req.params.lessonId as string;
    await assertLessonOwnerOrAdmin(lessonId, req.currentUser!);

    const result = await initiateLessonVideoUpload(lessonId, req.body.title);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const handleGetLessonVideo = async (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.user as { id: string } | undefined)?.id;
    const video = await getLessonVideoGated(req.params.lessonId as string, userId);
    res.status(200).json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
};

export const handleGetVideoPlayback = async (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.user as { id: string } | undefined)?.id;
    const playback = await getVideoPlaybackInfo(req.params.lessonId as string, userId);
    res.status(200).json({ success: true, data: playback });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteLessonVideo = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lessonId = req.params.lessonId as string;
    await assertLessonOwnerOrAdmin(lessonId, req.currentUser!);

    await deleteLessonVideo(lessonId);
    res.status(200).json({ success: true, message: "video deleted" });
  } catch (error) {
    next(error);
  }
};

// Public endpoint Bunny calls when a video finishes encoding — guarded by a
// shared secret query param instead of a user JWT (Bunny has no user token).
export const handleBunnyVideoWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const expectedSecret = process.env.BUNNY_STREAM_WEBHOOK_SECRET;
    if (expectedSecret && req.query.secret !== expectedSecret) {
      res.status(401).json({ success: false, message: "invalid webhook secret" });
      return;
    }

    await handleBunnyWebhook(req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
