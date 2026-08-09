import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { validateToken } from "../../middlewares/authenticate.middleware.js";
import { requireRole } from "../../middlewares/authorize.middleware.js";
import { UserRole } from "../../types/user.types.js";
import { joinWaitlistSchema } from "./dtos/JoinWaitlistRequest.dto.js";
import { handleJoinWaitlist, handleListWaitlist } from "./waitlist.controller.js";

const router = Router();

router.post("/", validate(joinWaitlistSchema), handleJoinWaitlist);
router.get("/", validateToken, requireRole(UserRole.ADMIN), handleListWaitlist);

export default router;
