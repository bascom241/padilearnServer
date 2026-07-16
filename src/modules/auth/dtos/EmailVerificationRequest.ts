import {z} from "zod"

export const VerifyEmailRequestSchema = z.object({
    code: z.string().min(4, "length is invalid").trim() 
});


export type VerifyEmailRequestDto = z.infer<typeof VerifyEmailRequestSchema>


