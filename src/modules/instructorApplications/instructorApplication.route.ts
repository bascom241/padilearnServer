import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { validateToken } from "../../middlewares/authenticate.middleware.js";
import { requireRole } from "../../middlewares/authorize.middleware.js";
import { UserRole } from "../../types/user.types.js";
import { createInstructorApplicationSchema } from "./dtos/CreateInstructorApplicationRequest.dto.js";
import {
  handleApplyForInstructor,
  handleGetMyApplication,
  handleListApplications,
  handleApproveApplication,
  handleRejectApplication,
} from "./instructorApplication.controller.js";

const router = Router();

router.post(
  "/",
  validateToken,
  requireRole(UserRole.STUDENT),
  validate(createInstructorApplicationSchema),
  handleApplyForInstructor,
);
router.get("/me", validateToken, requireRole(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN), handleGetMyApplication);

router.get("/", validateToken, requireRole(UserRole.ADMIN), handleListApplications);
router.post("/:applicationId/approve", validateToken, requireRole(UserRole.ADMIN), handleApproveApplication);
router.post("/:applicationId/reject", validateToken, requireRole(UserRole.ADMIN), handleRejectApplication);

export default router;
