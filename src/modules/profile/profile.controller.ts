import type { NextFunction, Request, Response } from "express";
import { getProfile, updateProfile, updateProfileAvatar } from "./profile.service.js";
import { AppError } from "../../error/AppError.js";
import { uploadImageBuffer } from "../../config/cloudinary.js";


interface AuthRequest extends Request {
  user?: { id: string, email: string };
}
export const getUserProfile = async( req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {email, id} = req.user as any;
        if(!email){
            throw new AppError("Access Denied", 400)
        }

        const data = await getProfile(email, id);
        res.status(200).json({success: true, data, message:"profile fetched successfully"})
    } catch (error) {
        next(error)
    }
}

export const handleUpdateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {email} = req.user as any;
        if(!email){
            throw new AppError("Access Denied", 400)
        }

        const data = await updateProfile(email, req.body);
        res.status(200).json({success: true, data, message: "profile updated successfully"})
    } catch (error) {
        next(error)
    }
}

export const handleUploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {email} = req.user as any;
        if(!email){
            throw new AppError("Access Denied", 400)
        }
        const file = (req as any).file as Express.Multer.File | undefined;
        if (!file) {
            throw new AppError("avatar image is required", 400);
        }

        const avatarUrl = await uploadImageBuffer(file.buffer, "padilearn/avatars");
        const data = await updateProfileAvatar(email, avatarUrl);
        res.status(200).json({success: true, data, message: "avatar updated successfully"})
    } catch (error) {
        next(error)
    }
}
