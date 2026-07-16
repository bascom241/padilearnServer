import { createModuleSchema} from "./CreateModuleRequest.dto.js";
import {z} from "zod"

export const updateModuleSchema =
    createModuleSchema.partial();

export type UpdateModuleRequest =
    z.infer<typeof updateModuleSchema>;