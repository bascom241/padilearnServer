import { z } from "zod";
import { CourseLevel } from "../../types/course.types.js";

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

    category: z
        .string()
        .trim()
        .min(2, "Category is required"),

    level: z
        .enum(CourseLevel)
        .optional(),

    price: z
        .number()
        .min(0, "Price cannot be negative"),
});

export type CreateCourseRequest = z.infer<typeof createCourseSchema>;
