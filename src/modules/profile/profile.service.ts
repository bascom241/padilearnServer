import { validateRequestBodyWithValues } from "../../utils/validateRequestBody.js";
import type { CreateProfileRequestDto } from "./dtos/createProfileRequest.dto.js";
import type { CreateProfileResponse } from "./dtos/createProfileResponse.dto.js";
import type { UpdateProfileRequestDto } from "./dtos/updateProfileRequest.dto.js";
import profileModel from "./profile.model.js";
import { AppError } from "../../error/AppError.js";
import { getProfileStats, type ProfileStats } from "./profileStats.service.js";

type ProfileDoc = {
  fullName: string;
  email: string;
  role: unknown;
  isEmailSent: boolean;
  bio?: string | null;
  avatarUrl?: string | null;
};

const toProfileResponse = (
  profile: ProfileDoc,
  stats?: ProfileStats,
  id?: string,
): CreateProfileResponse => ({
  fullName: profile.fullName,
  email: profile.email,
  role: String(profile.role),
  isEmailSent: profile.isEmailSent,
  ...(profile.bio != null && { bio: profile.bio }),
  ...(profile.avatarUrl != null && { avatarUrl: profile.avatarUrl }),
  ...(stats !== undefined && { stats }),
  ...(id !== undefined && { id }),
});

export const createProfile = async (
  data: CreateProfileRequestDto,
): Promise<CreateProfileResponse> => {
  validateRequestBodyWithValues<CreateProfileRequestDto>(data, [
    "email",
    "fullName",
  ]);
  const { fullName, email, role, isEmailSent, userId } = data;
  const profile = await profileModel.findOne({ email });

  if (profile) {
    throw new AppError("profile already exists", 400);
  }
  const newProfile = await profileModel.create({
    fullName,
    email,
    ...(role && { role }),
    ...(userId && { user: userId }),
    isEmailSent: isEmailSent ?? false,
  });
  return toProfileResponse(newProfile);
};

export const getProfile = async (
  email: string,
  userId?: string,
): Promise<CreateProfileResponse> => {

  if (email === null) {
    throw new AppError("email is required", 400);
  }

  const profile = await profileModel.findOne({ email });

  if(!profile){
    throw new AppError("profile not found", 400)
  }

  const stats = userId ? await getProfileStats(userId) : undefined;

  return toProfileResponse(profile, stats, userId);
};

export const updateProfile = async (
  email: string,
  data: UpdateProfileRequestDto,
): Promise<CreateProfileResponse> => {
  const profile = await profileModel.findOne({ email });
  if (!profile) {
    throw new AppError("profile not found", 404);
  }

  Object.assign(profile, data);
  await profile.save();

  return toProfileResponse(profile);
};

export const updateProfileAvatar = async (
  email: string,
  avatarUrl: string,
): Promise<CreateProfileResponse> => {
  const profile = await profileModel.findOne({ email });
  if (!profile) {
    throw new AppError("profile not found", 404);
  }

  profile.avatarUrl = avatarUrl;
  await profile.save();

  return toProfileResponse(profile);
};
