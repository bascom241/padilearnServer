import mongoose, { Schema } from "mongoose";
import { EnrollmentStatus } from "./types/enrollment.types.js";

const enrollmentSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "student is required"],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "course is required"],
    },
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.PENDING,
    },
    amount: {
      type: Number,
      required: [true, "amount is required"],
    },
    paystackReference: {
      type: String,
      required: [true, "paystack reference is required"],
      unique: true,
    },
    paidAt: Date,
  },
  { timestamps: true },
);

enrollmentSchema.index({ student: 1, course: 1 });

export default mongoose.model("Enrollment", enrollmentSchema);
