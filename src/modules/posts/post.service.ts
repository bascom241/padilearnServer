import postModel from "./post.model.js";
import reactionModel from "./reaction.model.js";
import replyModel from "./reply.model.js";
import { AppError } from "../../error/AppError.js";
import { ReactionType } from "./types/post.types.js";
import type { CreatePostRequest } from "./dtos/CreatePostRequest.dto.js";
import type { CreateReplyRequest } from "./dtos/CreateReplyRequest.dto.js";

export const createPost = async (data: CreatePostRequest, authorId: string) => {
  return postModel.create({
    content: data.content,
    author: authorId,
    ...(data.tag !== undefined && { tag: data.tag }),
  });
};

const attachMyReactions = async (postIds: string[], currentUserId?: string) => {
  if (!currentUserId || postIds.length === 0) return new Map<string, ReactionType[]>();

  const reactions = await reactionModel.find({ post: { $in: postIds }, user: currentUserId });
  const map = new Map<string, ReactionType[]>();
  for (const reaction of reactions) {
    const key = reaction.post.toString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(reaction.type as ReactionType);
  }
  return map;
};

export const listFeed = async (
  query: { page?: string; limit?: string },
  currentUserId?: string,
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const [posts, total] = await Promise.all([
    postModel
      .find()
      .populate("author", "fullName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    postModel.countDocuments(),
  ]);

  const myReactions = await attachMyReactions(
    posts.map((p) => p._id.toString()),
    currentUserId,
  );

  const postsWithReactions = posts.map((post) => {
    const reactions = myReactions.get(post._id.toString()) ?? [];
    return {
      ...post.toObject(),
      isLikedByMe: reactions.includes(ReactionType.LIKE),
      isRetweetedByMe: reactions.includes(ReactionType.RETWEET),
    };
  });

  return {
    posts: postsWithReactions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const findPostOrThrow = async (postId: string) => {
  const post = await postModel.findById(postId);
  if (!post) {
    throw new AppError("post not found", 404);
  }
  return post;
};

export const getPostById = async (postId: string, currentUserId?: string) => {
  const post = await postModel.findById(postId).populate("author", "fullName email");
  if (!post) {
    throw new AppError("post not found", 404);
  }

  const myReactions = await attachMyReactions([postId], currentUserId);
  const reactions = myReactions.get(postId) ?? [];

  return {
    ...post.toObject(),
    isLikedByMe: reactions.includes(ReactionType.LIKE),
    isRetweetedByMe: reactions.includes(ReactionType.RETWEET),
  };
};

export const deletePost = async (
  postId: string,
  currentUser: { id: string; role: string },
) => {
  const post = await findPostOrThrow(postId);

  if (currentUser.role !== "admin" && post.author.toString() !== currentUser.id) {
    throw new AppError("You do not have permission to delete this post", 403);
  }

  await reactionModel.deleteMany({ post: postId });
  await replyModel.deleteMany({ post: postId });
  await post.deleteOne();
};

// Toggles a like/retweet: creates the reaction (and bumps the counter) if it
// doesn't exist yet, or removes it (and drops the counter) if it does.
export const toggleReaction = async (
  postId: string,
  userId: string,
  type: ReactionType,
) => {
  const post = await findPostOrThrow(postId);
  const countField = type === ReactionType.LIKE ? "likesCount" : "retweetsCount";

  const existing = await reactionModel.findOne({ post: postId, user: userId, type });

  if (existing) {
    await existing.deleteOne();
    post.set(countField, Math.max((post.get(countField) as number) - 1, 0));
    await post.save();
    return { active: false, post };
  }

  await reactionModel.create({ post: postId, user: userId, type });
  post.set(countField, (post.get(countField) as number) + 1);
  await post.save();
  return { active: true, post };
};

export const createReply = async (
  postId: string,
  data: CreateReplyRequest,
  authorId: string,
) => {
  const post = await findPostOrThrow(postId);

  const reply = await replyModel.create({ ...data, post: postId, author: authorId });
  post.repliesCount += 1;
  await post.save();

  return reply;
};

export const listReplies = async (postId: string) => {
  return replyModel.find({ post: postId }).populate("author", "fullName email").sort({ createdAt: 1 });
};
