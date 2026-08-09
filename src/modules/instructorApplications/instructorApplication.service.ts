import instructorApplicationModel from "./instructorApplication.model.js";
import userModel from "../user/user.model.js";
import { AppError } from "../../error/AppError.js";
import { ApplicationStatus } from "./types/instructorApplication.types.js";
import { UserRole } from "../../types/user.types.js";
import type { CreateInstructorApplicationRequest } from "./dtos/CreateInstructorApplicationRequest.dto.js";

export const applyForInstructor = async (
  userId: string,
  data: CreateInstructorApplicationRequest,
) => {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError("user not found", 404);
  }
  if (user.role !== UserRole.STUDENT) {
    throw new AppError("only students can apply to become an instructor", 400);
  }

  const existingPending = await instructorApplicationModel.findOne({
    user: userId,
    status: ApplicationStatus.PENDING,
  });
  if (existingPending) {
    throw new AppError("you already have a pending application", 400);
  }

  return instructorApplicationModel.create({ user: userId, motivation: data.motivation });
};

export const getMyApplication = async (userId: string) => {
  return instructorApplicationModel.findOne({ user: userId }).sort({ createdAt: -1 });
};

export const listApplications = async (status?: string) => {
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  return instructorApplicationModel
    .find(filter)
    .populate("user", "fullName email role")
    .sort({ createdAt: -1 });
};

const findApplicationOrThrow = async (applicationId: string) => {
  const application = await instructorApplicationModel.findById(applicationId);
  if (!application) {
    throw new AppError("application not found", 404);
  }
  return application;
};

export const approveApplication = async (applicationId: string, adminId: string) => {
  const application = await findApplicationOrThrow(applicationId);
  if (application.status !== ApplicationStatus.PENDING) {
    throw new AppError("only a pending application can be approved", 400);
  }

  application.status = ApplicationStatus.APPROVED;
  application.set("reviewedBy", adminId);
  application.reviewedAt = new Date();
  await application.save();

  await userModel.findByIdAndUpdate(application.user, { role: UserRole.INSTRUCTOR });

  return application;
};

export const rejectApplication = async (applicationId: string, adminId: string) => {
  const application = await findApplicationOrThrow(applicationId);
  if (application.status !== ApplicationStatus.PENDING) {
    throw new AppError("only a pending application can be rejected", 400);
  }

  application.status = ApplicationStatus.REJECTED;
  application.set("reviewedBy", adminId);
  application.reviewedAt = new Date();
  await application.save();

  return application;
};
