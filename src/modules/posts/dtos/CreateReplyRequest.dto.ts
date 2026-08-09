import { z } from "zod";

export const createReplySchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, "Reply cannot be empty")
        .max(280, "Reply cannot exceed 280 characters"),
});

export type CreateReplyRequest = z.infer<typeof createReplySchema>;
