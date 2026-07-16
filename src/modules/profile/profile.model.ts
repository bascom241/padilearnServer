import mongoose, { Schema } from "mongoose";
import { UserRole } from "../../types/user.types.js";

export const profileSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "fullName is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    isEmailSent: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Profile", profileSchema);
