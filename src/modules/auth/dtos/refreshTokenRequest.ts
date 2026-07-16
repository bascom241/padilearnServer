import {z} from "zod"


export const RefreshTokenSchema = z.object({
    refreshToken: z.string().trim()
})


export type RefreshTokenRequestDto = z.infer<typeof RefreshTokenSchema>;