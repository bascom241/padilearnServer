import type { Response, NextFunction } from "express";
import type { AuthorizedRequest } from "../../middlewares/authorize.middleware.js";
import type { ValidateRequestType } from "../../middlewares/authenticate.middleware.js";
import {
  createPost,
  listFeed,
  getPostById,
  deletePost,
  toggleReaction,
  createReply,
  listReplies,
} from "./post.service.js";
import { ReactionType } from "./types/post.types.js";

export const handleCreatePost = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const post = await createPost(req.body, req.currentUser!.id);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const handleListFeed = async (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.user as { id: string } | undefined)?.id;
    const result = await listFeed(req.query as Record<string, string>, userId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const handleGetPost = async (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.user as { id: string } | undefined)?.id;
    const post = await getPostById(req.params.postId as string, userId);
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const handleDeletePost = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deletePost(req.params.postId as string, req.currentUser!);
    res.status(200).json({ success: true, message: "post deleted" });
  } catch (error) {
    next(error);
  }
};

export const handleToggleLike = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await toggleReaction(
      req.params.postId as string,
      req.currentUser!.id,
      ReactionType.LIKE,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const handleToggleRetweet = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await toggleReaction(
      req.params.postId as string,
      req.currentUser!.id,
      ReactionType.RETWEET,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const handleCreateReply = async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reply = await createReply(req.params.postId as string, req.body, req.currentUser!.id);
    res.status(201).json({ success: true, data: reply });
  } catch (error) {
    next(error);
  }
};

export const handleListReplies = async (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    const replies = await listReplies(req.params.postId as string);
    res.status(200).json({ success: true, data: replies });
  } catch (error) {
    next(error);
  }
};
