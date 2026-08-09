import { z } from "zod";

export const createInstructorApplicationSchema = z.object({
    motivation: z
        .string()
        .trim()
        .min(20, "Tell us a bit more — at least 20 characters")
        .max(2000),
});

export type CreateInstructorApplicationRequest = z.infer<typeof createInstructorApplicationSchema>;
