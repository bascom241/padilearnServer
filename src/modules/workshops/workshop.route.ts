import { Router, text } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { validateToken } from "../../middlewares/authenticate.middleware.js";
import { requireRole } from "../../middlewares/authorize.middleware.js";
import { UserRole } from "../../types/user.types.js";
import { createWorkshopSchema } from "./dtos/CreateWorkshopRequest.dto.js";
import { updateWorkshopSchema } from "./dtos/UpdateWorkshopRequest.dto.js";
import {
  handleCreateWorkshop,
  handleListWorkshops,
  handleGetWorkshop,
  handleUpdateWorkshop,
  handleStartWorkshop,
  handleEndWorkshop,
  handleCancelWorkshop,
  handleJoinWorkshop,
  handlePromoteParticipant,
  handleDemoteParticipant,
  handleLiveKitWebhook,
} from "./workshop.controller.js";

const router = Router();

// LiveKit signs the raw request body, so this needs the raw text body (not
// JSON-parsed). Mounted separately in app.ts, before the global express.json().
export const workshopWebhookRouter = Router();
workshopWebhookRouter.post("/webhook", text({ type: "*/*" }), handleLiveKitWebhook);

// the Explore feed — public browsing, no auth required
router.get("/", handleListWorkshops);
router.get("/:workshopId", handleGetWorkshop);

router.post(
  "/",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  validate(createWorkshopSchema),
  handleCreateWorkshop,
);
router.patch(
  "/:workshopId",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  validate(updateWorkshopSchema),
  handleUpdateWorkshop,
);
router.post(
  "/:workshopId/start",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  handleStartWorkshop,
);
router.post(
  "/:workshopId/end",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  handleEndWorkshop,
);
router.delete(
  "/:workshopId",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  handleCancelWorkshop,
);

// any authenticated user (student or instructor) can join as a listener
router.post("/:workshopId/join", validateToken, handleJoinWorkshop);

router.post(
  "/:workshopId/participants/:userId/promote",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  handlePromoteParticipant,
);
router.post(
  "/:workshopId/participants/:userId/demote",
  validateToken,
  requireRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  handleDemoteParticipant,
);

export default router;
