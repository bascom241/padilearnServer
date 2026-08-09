import { z } from "zod";

export const joinWaitlistSchema = z.object({
    email: z.email("Please enter a valid email").toLowerCase().trim(),
});

export type JoinWaitlistRequest = z.infer<typeof joinWaitlistSchema>;
