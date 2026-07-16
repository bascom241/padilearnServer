import {z} from "zod"
import { createLessonSchema } from "./createLessonRequest.dto.js";


export const updateLessonSchema =
    createLessonSchema.partial();

export type UpdateLessonRequest =
    z.infer<typeof updateLessonSchema>;