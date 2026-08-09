import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "author is required"],
    },
    content: {
      type: String,
      required: [true, "content is required"],
      trim: true,
      maxlength: 280,
    },
    tag: {
      type: String,
      trim: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    retweetsCount: {
      type: Number,
      default: 0,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Post", postSchema);
