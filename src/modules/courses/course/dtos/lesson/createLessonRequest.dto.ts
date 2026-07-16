import { z } from "zod";

export const createLessonSchema = z.object({

    module: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid module id"),

    title: z
        .string()
        .trim()
        .min(3),

    description: z
        .string()
        .trim()
        .min(5),

    order: z
        .number()
        .int()
        .min(1),

    isPreview: z
        .boolean()
        .optional()
});

export type CreateLessonRequest =
    z.infer<typeof createLessonSchema>;