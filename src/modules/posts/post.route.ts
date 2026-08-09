import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { validateToken, attemptAuthenticate } from "../../middlewares/authenticate.middleware.js";
import { requireRole } from "../../middlewares/authorize.middleware.js";
import { UserRole } from "../../types/user.types.js";
import { createPostSchema } from "./dtos/CreatePostRequest.dto.js";
import { createReplySchema } from "./dtos/CreateReplyRequest.dto.js";
import {
  handleCreatePost,
  handleListFeed,
  handleGetPost,
  handleDeletePost,
  handleToggleLike,
  handleToggleRetweet,
  handleCreateReply,
  handleListReplies,
} from "./post.controller.js";

const router = Router();

// any authenticated user (student, instructor or admin) can post — requireRole
// reads req.user, which only validateToken populates, so it must run first.
const anyAuthenticatedUser = [validateToken, requireRole(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN)];

router.get("/", attemptAuthenticate, handleListFeed);
router.get("/:postId", attemptAuthenticate, handleGetPost);
router.get("/:postId/replies", attemptAuthenticate, handleListReplies);

router.post("/", ...anyAuthenticatedUser, validate(createPostSchema), handleCreatePost);
router.delete("/:postId", ...anyAuthenticatedUser, handleDeletePost);
router.post("/:postId/like", ...anyAuthenticatedUser, handleToggleLike);
router.post("/:postId/retweet", ...anyAuthenticatedUser, handleToggleRetweet);
router.post("/:postId/replies", ...anyAuthenticatedUser, validate(createReplySchema), handleCreateReply);

export default router;
