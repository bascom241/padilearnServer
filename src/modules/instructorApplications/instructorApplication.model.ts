import mongoose, { Schema } from "mongoose";
import { ApplicationStatus } from "./types/instructorApplication.types.js";

const instructorApplicationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user is required"],
    },
    motivation: {
      type: String,
      required: [true, "motivation is required"],
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("InstructorApplication", instructorApplicationSchema);
