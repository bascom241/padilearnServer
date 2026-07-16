import { validateRequestBodyWithValues } from "../../utils/validateRequestBody.js";
import type { CreateProfileRequestDto } from "./dtos/createProfileRequest.dto.js";
import type { CreateProfileResponse } from "./dtos/createProfileResponse.dto.js";
import profileModel from "./profile.model.js";
import { AppError } from "../../error/AppError.js";

export const createProfile = async (
  data: CreateProfileRequestDto,
): Promise<CreateProfileResponse> => {
  validateRequestBodyWithValues<CreateProfileRequestDto>(data, [
    "email",
    "fullName",
  ]);
  const { fullName, email, role, isEmailSent } = data;
  const profile = await profileModel.findOne({ email });

  if (profile) {
    throw new AppError("profile already exists", 400);
  }
  const newProfile = await profileModel.create({
    fullName,
    email,
    ...(role && { role }),
    isEmailSent: isEmailSent ?? false,
  });
  return {
    fullName: newProfile.fullName,
    email: newProfile.email,
    role: newProfile.role.toString(),
    isEmailSent: newProfile.isEmailSent,
  };
};

export const getProfile = async (
  email: string,
): Promise<CreateProfileResponse> => {
    
  if (email === null) {
    throw new AppError("email is required", 400);
  }

  const profile = await profileModel.findOne({ email });

  if(!profile){
    throw new AppError("profile not found", 400)
  }
  return {
    fullName: profile.fullName,
    email: profile.email,
    role: profile.role.toString(),
    isEmailSent: profile.isEmailSent,
  };
};
