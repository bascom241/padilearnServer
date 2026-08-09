import { Router } from "express";
import { validate } from "../../../middlewares/validate.middleware.js";
import { validateToken } from "../../../middlewares/authenticate.middleware.js";
import { requireRole } from "../../../middlewares/authorize.middleware.js";
import { UserRole } from "../../../types/user.types.js";
import { createLessonSchema } from "../course/dtos/lesson/createLessonRequest.dto.js";
import { updateModuleSchema } from "../course/dtos/module/UpdateModuleRequest.dto.js";
import {
  handleGetModule,
  handleUpdateModule,
  handleDeleteModule,
  handleCreateModule
} from "./module.controller.js";
import {
  handleCreateLesson,
  handleListLessonsForModule,
} from "../lesson/lesson.controller.js";


const router = Router();
router.post("/", validateToken,requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN), handleCreateModule)
router.get("/:moduleId", validateToken, handleGetModule);
router.patch(
  "/:moduleId",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  validate(updateModuleSchema),
  handleUpdateModule,
);
router.delete(
  "/:moduleId",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  handleDeleteModule,
);



// nested lessons — a module can have at most 5 lessons (enforced in lesson.service)
router.get("/:moduleId/lessons", validateToken, handleListLessonsForModule);
router.post(
  "/:moduleId/lessons",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  validate(createLessonSchema),
  handleCreateLesson,
);

export default router;
