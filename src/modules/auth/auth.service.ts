import type { RegisterRequestDto } from "./dtos/regiterRequest.dto.js";
import type { RegisterationResponseDto } from "./dtos/registerResponse.dto.js";
import { AppError } from "../../error/AppError.js";
import userModel from "../user/user.model.js";

import { validateRequestBodyWithValues } from "../../utils/validateRequestBody.js";
import { sendEmail } from "../../config/mail.js";
import type { VerifyEmailRequestDto } from "./dtos/EmailVerificationRequest.js";
import bcrypt from "bcryptjs";
import {
  genarateRefreshToken,
  generateToken,
} from "../../utils/generateToken.js";
import type { VerificationResponse } from "./dtos/EmailVerificationResponse.js";
import type { RefreshTokenRequestDto } from "./dtos/refreshTokenRequest.js";
import jwt from "jsonwebtoken";
import type { RefreshTokenResponse } from "./dtos/refreshTokenResponse.js";
import type { LoginRequestDto } from "./dtos/loginRequest.dto.js";
import type { LoginResponseDto } from "./dtos/loginResponse.dto.js";
import { createProfile } from "../profile/profile.service.js";
import type { CreateProfileRequestDto } from "../profile/dtos/createProfileRequest.dto.js";

export const registerUser = async (
  data: RegisterRequestDto,
): Promise<RegisterationResponseDto> => {
  validateRequestBodyWithValues<RegisterRequestDto>(data, [
    "fullName",
    "email",
    "password",
  ]);
  const { fullName, email, password } = data;

  const user = await userModel.findOne({ email });

  if (user) {
    throw new AppError("user already exists", 400);
  }
  const hashPassword = await bcrypt.hash(password, 8);

  const verificationToken = Math.floor(1000 + Math.random() * 9000).toString();
  const hashToken = await bcrypt.hash(verificationToken, 8);

  const newUser = await userModel.create({
    fullName: data.fullName,
    email: data.email,
    password: hashPassword,
    verificationToken: hashToken,
    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  let passedData: CreateProfileRequestDto = {
    fullName,
    email,
    isEmailSent: false,
    userId: newUser._id.toString(),
  };
  let isEmailSent = true;
  try {
    const response = await sendEmail(email, fullName, verificationToken);
    passedData.isEmailSent = true;
    console.log("Email Sent successfully", response.data);
  } catch (error) {
    console.error("Failed to send verification Email", error);

    isEmailSent = false;
  }

  await createProfile(passedData);

  return {
    fullName: newUser.fullName,
    email: newUser.email,
    emailSent: isEmailSent,
    message: "registeration successful",
  };
};

export const verifyEmail = async (
  data: VerifyEmailRequestDto,
): Promise<VerificationResponse> => {
  validateRequestBodyWithValues<VerifyEmailRequestDto>(data, ["code"]);

  const { code } = data;

  const user = await userModel.findOne({
    verificationToken: { $exists: true },
    verificationTokenExpiresAt: { $gte: Date.now() },
  });

  if (!user) {
    throw new AppError("user does not exists", 400);
  }

  const isMatch = await bcrypt.compare(code, user.verificationToken as string);

  if (!isMatch) {
    throw new AppError("invalid code", 400);
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiresAt = null;

  await user.save();

  const accessToken = generateToken({
    id: user._id.toString(),
    email: user.email,
  });

  const refreshToken = genarateRefreshToken({
    id: user._id.toString(),
  });

  return {
    message: "Login succesful",
    accessToken,
    refreshToken,
  };
};

export const handleRefreshToken = async (
  data: RefreshTokenRequestDto,
): Promise<RefreshTokenResponse> => {
  validateRequestBodyWithValues<RefreshTokenRequestDto>(data, ["refreshToken"]);
  const { refreshToken } = data;

  const refreshKey = process.env.REFRESH_TOKEN_SECRET;

  let decoded: any;

  try {
    if (refreshKey) {
      decoded = jwt.verify(refreshToken, refreshKey);
    }
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await userModel.findById(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError("user not found", 500);
  }

  const accessToken = generateToken({
    id: user._id.toString(),
    email: user.email,
  });

  const refreshTokenData = genarateRefreshToken({
    id: user._id.toString(),
  });

  return {
    accessToken,
    refreshToken: refreshTokenData,
  };
};

export const loginUser = async (
  data: LoginRequestDto,
): Promise<LoginResponseDto> => {
  validateRequestBodyWithValues<LoginRequestDto>(data, ["email", "password"]);
  const { email, password } = data;

  const user = await userModel.findOne({ email });

  if (!user) {
    throw new AppError("user not found", 404);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new AppError("invalid login details", 404);
  }

  const accessToken = generateToken({
    id: user._id.toString(),
    email: user.email,
  });

  const refreshTokenData = genarateRefreshToken({
    id: user._id.toString(),
  });

  return {
    accessToken,
    refreshToken: refreshTokenData,
  };
};
