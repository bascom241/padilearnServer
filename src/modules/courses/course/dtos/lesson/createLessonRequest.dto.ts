import { z } from "zod";

export const createLessonSchema = z.object({

    title: z
        .string()
        .trim()
        .min(3),

    description: z
        .string()
        .trim()
        .min(5),

    isPreview: z
        .boolean()
        .optional()
});

export type CreateLessonRequest =
    z.infer<typeof createLessonSchema>;
