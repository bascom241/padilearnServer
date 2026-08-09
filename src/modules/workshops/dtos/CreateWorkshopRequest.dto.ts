import { z } from "zod";

export const createWorkshopSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, "Title must be at least 3 characters"),

    description: z
        .string()
        .trim()
        .min(10, "Description is required"),

    coverImage: z
        .string()
        .url("Cover image must be a valid URL")
        .optional(),

    scheduledAt: z
        .coerce.date()
        .optional(),

    maxParticipants: z
        .number()
        .int()
        .min(2)
        .optional(),
});

export type CreateWorkshopRequest = z.infer<typeof createWorkshopSchema>;
