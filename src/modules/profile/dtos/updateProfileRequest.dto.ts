import { z } from "zod";

export const UpdateProfileSchema = z.object({
    fullName: z.string().min(2, "Name is too short").trim().optional(),
    bio: z.string().trim().max(280, "Bio cannot exceed 280 characters").optional(),
});

export type UpdateProfileRequestDto = z.infer<typeof UpdateProfileSchema>;
