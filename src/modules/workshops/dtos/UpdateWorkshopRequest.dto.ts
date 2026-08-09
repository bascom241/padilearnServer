import { z } from "zod";
import { createWorkshopSchema } from "./CreateWorkshopRequest.dto.js";

export const updateWorkshopSchema = createWorkshopSchema.partial();

export type UpdateWorkshopRequest = z.infer<typeof updateWorkshopSchema>;
