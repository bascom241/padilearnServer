import { z } from "zod";

export const createModuleSchema = z.object({

    course: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid course id"),

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

    lessonCount: z
        .number()
        .int()
        .min(0)
        .optional(),

    duration: z
        .number()
        .min(0)
        .optional()
});

export type CreateModuleRequest = z.infer<typeof createModuleSchema>;