import {z} from "zod"

export const LoginRegisterSchema = z.object({
    email: z.email("Invalid email").toLowerCase().trim(),
    password: z.string().min(8, "Password must be at least 8 characters long")
});

export type LoginRequestDto = z.infer<typeof LoginRegisterSchema>