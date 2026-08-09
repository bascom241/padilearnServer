import { Router } from "express";
import { validate } from "../../../middlewares/validate.middleware.js";
import { validateToken, attemptAuthenticate } from "../../../middlewares/authenticate.middleware.js";
import { requireRole } from "../../../middlewares/authorize.middleware.js";
import { UserRole } from "../../../types/user.types.js";
import { updateLessonSchema } from "../course/dtos/lesson/UpdateLessonRequest.dto.js";
import {
  handleGetLesson,
  handleUpdateLesson,
  handleDeleteLesson,
  handleMarkLessonComplete,
} from "./lesson.controller.js";
import { lessonVideoRouter } from "../video/video.route.js";

const router = Router();

router.get("/:lessonId", attemptAuthenticate, handleGetLesson);
router.patch(
  "/:lessonId",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  validate(updateLessonSchema),
  handleUpdateLesson,
);
router.delete(
  "/:lessonId",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  handleDeleteLesson,
);

router.post("/:lessonId/complete", validateToken, handleMarkLessonComplete);

router.use("/:lessonId/video", lessonVideoRouter);

export default router;
