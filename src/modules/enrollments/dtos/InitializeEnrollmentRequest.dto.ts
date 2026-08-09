import { z } from "zod";

export const initializeEnrollmentSchema = z.object({
    courseId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid course id"),
});

export type InitializeEnrollmentRequest = z.infer<typeof initializeEnrollmentSchema>;
