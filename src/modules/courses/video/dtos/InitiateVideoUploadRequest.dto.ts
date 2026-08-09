import { z } from "zod";

export const initiateVideoUploadSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3),
});

export type InitiateVideoUploadRequest = z.infer<typeof initiateVideoUploadSchema>;
