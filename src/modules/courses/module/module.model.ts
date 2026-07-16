import mongoose, { Schema } from "mongoose";

const moduleSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      required: [true, "course id is required"],
      ref: "Course",
    },
    order: Number,
    lessonCount: Number,
    duration: Number,
    title: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Module", moduleSchema);
