import {z} from "zod"
import { UserRole } from "../../../types/user.types.js"


export const CreateProfileSchema = z.object({
    fullName: z.string().min(2, "Name is too short").trim(),
    email: z.email("Invalid email format").toLowerCase().trim(),
    role: z.enum(UserRole).optional(), 
    isEmailSent: z.boolean().optional()
})

export type CreateProfileRequestDto = z.infer<typeof CreateProfileSchema> 