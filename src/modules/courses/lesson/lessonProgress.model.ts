import mongoose, { Schema } from "mongoose";

const lessonProgressSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "student is required"],
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "lesson is required"],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "course is required"],
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

lessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

export default mongoose.model("LessonProgress", lessonProgressSchema);
