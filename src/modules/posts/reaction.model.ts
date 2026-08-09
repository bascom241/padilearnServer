import mongoose, { Schema } from "mongoose";
import { ReactionType } from "./types/post.types.js";

const reactionSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "post is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user is required"],
    },
    type: {
      type: String,
      enum: Object.values(ReactionType),
      required: [true, "reaction type is required"],
    },
  },
  { timestamps: true },
);

// One like and one retweet per user per post — toggling relies on this being unique.
reactionSchema.index({ post: 1, user: 1, type: 1 }, { unique: true });

export default mongoose.model("Reaction", reactionSchema);
