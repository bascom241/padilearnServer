import enrollmentModel from "./enrollment.model.js";
import courseModel from "../courses/course/course.model.js";
import userModel from "../user/user.model.js";
import { AppError } from "../../error/AppError.js";
import { EnrollmentStatus } from "./types/enrollment.types.js";
import { paystackApi, withPaystackAuthHeaders } from "../../config/paystack.js";

const PAYSTACK_KOBO_MULTIPLIER = 100;

export const hasActiveEnrollment = async (userId: string, courseId: string) => {
  const enrollment = await enrollmentModel.exists({
    student: userId,
    course: courseId,
    status: EnrollmentStatus.ACTIVE,
  });
  return Boolean(enrollment);
};

export const initializeEnrollment = async (courseId: string, userId: string) => {
  const course = await courseModel.findById(courseId);
  if (!course) {
    throw new AppError("course not found", 404);
  }
  if (!course.isPublished) {
    throw new AppError("this course is not available for enrollment", 400);
  }

  const alreadyEnrolled = await hasActiveEnrollment(userId, courseId);
  if (alreadyEnrolled) {
    throw new AppError("you are already enrolled in this course", 400);
  }

  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError("user not found", 404);
  }

  // Free courses skip Paystack entirely and are enrolled immediately.
  if (course.price === 0) {
    const enrollment = await enrollmentModel.create({
      student: userId,
      course: courseId,
      status: EnrollmentStatus.ACTIVE,
      amount: 0,
      paystackReference: `free_${courseId}_${userId}_${Date.now()}`,
      paidAt: new Date(),
    });
    return { free: true, enrollment };
  }

  const reference = `enroll_${courseId}_${userId}_${Date.now()}`;

  const { data } = await paystackApi.post(
    "/transaction/initialize",
    {
      email: user.email,
      amount: Math.round(course.price * PAYSTACK_KOBO_MULTIPLIER),
      reference,
      metadata: { courseId, userId },
    },
    withPaystackAuthHeaders(),
  );

  await enrollmentModel.create({
    student: userId,
    course: courseId,
    status: EnrollmentStatus.PENDING,
    amount: course.price,
    paystackReference: reference,
  });

  return {
    free: false,
    authorizationUrl: data.data.authorization_url as string,
    accessCode: data.data.access_code as string,
    reference,
  };
};

const activateEnrollment = async (reference: string) => {
  const enrollment = await enrollmentModel.findOne({ paystackReference: reference });
  if (!enrollment) return null;

  if (enrollment.status !== EnrollmentStatus.ACTIVE) {
    enrollment.status = EnrollmentStatus.ACTIVE;
    enrollment.paidAt = new Date();
    await enrollment.save();
  }
  return enrollment;
};

// Fallback for when the mobile app returns from the Paystack checkout before
// the webhook arrives — actively asks Paystack for the transaction's status.
export const verifyEnrollment = async (reference: string, userId: string) => {
  const enrollment = await enrollmentModel.findOne({ paystackReference: reference });
  if (!enrollment) {
    throw new AppError("enrollment not found", 404);
  }
  if (enrollment.student.toString() !== userId) {
    throw new AppError("this enrollment does not belong to you", 403);
  }

  const { data } = await paystackApi.get(
    `/transaction/verify/${reference}`,
    withPaystackAuthHeaders(),
  );

  if (data.data.status !== "success") {
    throw new AppError("payment not yet successful", 400);
  }

  return activateEnrollment(reference);
};

export const handlePaystackWebhookEvent = async (event: { event: string; data: { reference: string } }) => {
  if (event.event !== "charge.success") return;
  await activateEnrollment(event.data.reference);
};

export const getMyEnrollments = async (userId: string) => {
  return enrollmentModel
    .find({ student: userId, status: EnrollmentStatus.ACTIVE })
    .populate("course")
    .sort({ createdAt: -1 });
};

export const getEnrollmentStatusForCourse = async (userId: string, courseId: string) => {
  return { enrolled: await hasActiveEnrollment(userId, courseId) };
};
