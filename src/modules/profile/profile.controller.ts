import type { NextFunction, Request, Response } from "express";
import { createProfile, getProfile } from "./profile.service.js";
import { AppError } from "../../error/AppError.js";


interface AuthRequest extends Request {
  user?: { id: string, email: string };
}
export const getUserProfile = async( req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {email} = req.user as any; 
        console.log(email)
        if(!email){
            throw new AppError("Access Denied", 400)
        }
    
        const data = await getProfile(email);
        res.status(200).json({success: true, data, message:"profile fetched successfully"})
    } catch (error) {
        next(error)
    }
}