import { z } from "zod";

export const createModuleSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3),

    description: z
        .string()
        .trim()
        .min(5),
});

export type CreateModuleRequest = z.infer<typeof createModuleSchema>;
