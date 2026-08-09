import mongoose, { Schema } from "mongoose";
import { CourseLevel, CourseStatus } from "./types/course.types.js";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    thumbnail: {
      type: String,
      required: [true, "thumbnail is required"],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    level: {
      type: String,
      enum: Object.values(CourseLevel),
      default: CourseLevel.BEGINNER,
    },
    price: {
      type: Number,
      required: [true, "price is required"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    // Review workflow: instructor creates in DRAFT, submits for review
    // (PENDING), and only an admin moving it to PUBLISHED flips isPublished.
    status: {
      type: String,
      enum: Object.values(CourseStatus),
      default: CourseStatus.DRAFT,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true },
);

export default mongoose.model("Course", courseSchema);
