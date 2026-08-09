import { Router, text } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { validateToken } from "../../middlewares/authenticate.middleware.js";
import { initializeEnrollmentSchema } from "./dtos/InitializeEnrollmentRequest.dto.js";
import {
  handleInitializeEnrollment,
  handleVerifyEnrollment,
  handleGetMyEnrollments,
  handleGetEnrollmentStatus,
  handlePaystackWebhook,
} from "./enrollment.controller.js";

const router = Router();

// Paystack signs the raw request body, so this needs the raw text body (not
// JSON-parsed). Mounted separately in app.ts, before the global express.json().
export const enrollmentWebhookRouter = Router();
enrollmentWebhookRouter.post("/webhook", text({ type: "*/*" }), handlePaystackWebhook);

router.post(
  "/initialize",
  validateToken,
  validate(initializeEnrollmentSchema),
  handleInitializeEnrollment,
);
router.get("/verify/:reference", validateToken, handleVerifyEnrollment);
router.get("/my", validateToken, handleGetMyEnrollments);
router.get("/course/:courseId/status", validateToken, handleGetEnrollmentStatus);

export default router;
