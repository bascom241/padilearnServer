import mongoose, { Schema } from "mongoose";

const waitlistSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Waitlist", waitlistSchema);
