import { Router } from "express";
import { validate } from "../../../middlewares/validate.middleware.js";
import { validateToken, attemptAuthenticate } from "../../../middlewares/authenticate.middleware.js";
import { requireRole } from "../../../middlewares/authorize.middleware.js";
import { UserRole } from "../../../types/user.types.js";
import { createCourseSchema } from "./dtos/course/CreateCourseRequest.dto.js";
import { updateCourseSchema } from "./dtos/course/UpdateCourseRequest.dto.js";
import { createModuleSchema } from "./dtos/module/CreateModuleRequest.dto.js";
import {
  handleCreateCourse,
  handleListCourses,
  handleGetCourse,
  handleUpdateCourse,
  handleSubmitCourseForReview,
  handleApproveCourse,
  handleRejectCourse,
  handleDeleteCourse,
} from "./course.controller.js";
import {
  handleCreateModule,
  handleListModulesForCourse,
} from "../module/module.controller.js";

const router = Router();

// courses are publicly browsable; only mutation requires auth
router.get("/", handleListCourses);
router.get("/:courseId", attemptAuthenticate, handleGetCourse);

router.post(
  "/",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  validate(createCourseSchema),
  handleCreateCourse,
);
router.patch(
  "/:courseId",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  validate(updateCourseSchema),
  handleUpdateCourse,
);
router.post(
  "/:courseId/submit-for-review",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  handleSubmitCourseForReview,
);
router.post(
  "/:courseId/approve",
  validateToken,
  requireRole(UserRole.ADMIN),
  handleApproveCourse,
);
router.post(
  "/:courseId/reject",
  validateToken,
  requireRole(UserRole.ADMIN),
  handleRejectCourse,
);
router.delete(
  "/:courseId",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  handleDeleteCourse,
);

// nested modules
router.get("/:courseId/modules", handleListModulesForCourse);
router.post(
  "/:courseId/modules",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  validate(createModuleSchema),
  handleCreateModule,
);

export default router;
