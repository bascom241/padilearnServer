import mongoose, { Schema } from "mongoose";
import { UserRole } from "../../types/user.types.js";

 const userSchema = new Schema({
  fullName: {
    type: String,
    required: [true, "full Name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  role: {
    type: String, 
    enum: Object.values(UserRole),
    default: UserRole.STUDENT
  }, 
  isVerified: {
    type: Boolean, 
    default: false
  }, 
  refreshToken: String,
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  resetPasswordToken: String,
  resetPasswordTokenExpiresAt: Date,
});


export default mongoose.model("User", userSchema);
