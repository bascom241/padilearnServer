import mongoose, { Schema } from "mongoose";

const replySchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "post is required"],
    },
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
  },
  { timestamps: true },
);

export default mongoose.model("Reply", replySchema);
