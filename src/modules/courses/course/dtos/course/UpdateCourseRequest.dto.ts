import {z} from "zod"
import { createCourseSchema } from "./CreateCourseRequest.dto.js";

export const updateCourseSchema = createCourseSchema.partial();

export type UpdateCourseRequest = z.infer<typeof updateCourseSchema>;