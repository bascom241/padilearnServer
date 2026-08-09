import type { ProfileStats } from "../profileStats.service.js";

export interface CreateProfileResponse {
    id?: string
    fullName: string
    email: string
    role: string
    isEmailSent: boolean
    bio?: string
    avatarUrl?: string
    stats?: ProfileStats
}
