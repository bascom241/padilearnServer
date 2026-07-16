import { z } from "zod";

export const createCourseSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, "Title must be at least 3 characters"),

    description: z
        .string()
        .trim()
        .min(10, "Description is required"),

    thumbnail: z
        .string()
        .url("Thumbnail must be a valid URL"),

    instructor: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid instructor id"),

    category: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid category id"),

    price: z
        .number()
        .min(0, "Price cannot be negative"),

    isPublished: z
        .boolean()
        .optional()
});

export type CreateCourseRequest = z.infer<typeof createCourseSchema>;