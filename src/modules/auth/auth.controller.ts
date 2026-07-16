
import type {Request, Response, NextFunction} from "express"
import { registerUser , verifyEmail, handleRefreshToken, loginUser} from "./auth.service.js"


export const handleRegister = async (req:Request, res: Response, next:NextFunction) => {
    try {
        const result = await registerUser(req.body);
        res.status(201).json({success: true, data: result})
    } catch (error) {
        next(error)
    }
};

export const verifyUserEmail = async (req: Request , res: Response, next:NextFunction) => {
    try {

        const {code} = req.body
        console.log("Recieved code:", code );
        console.log("req.body:", req.body);
        const result = await verifyEmail(req.body);
        res.status(200).json({success: true, data: result});
    } catch (error) {
        next(error)
    }
}

export const handleUserRefreshToken = async (req: Request, res: Response, next : NextFunction) => {
    try {
        const {refreshToken} = req.body
        const result = await handleRefreshToken(refreshToken);
        res.status(200).json({success: true, data: result})
    } catch (error) {
        next(error)
    }
}

export const login = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const data = await loginUser(req.body);
        res.status(200).json({success: true, data})
    } catch (error) {
        next(error)
    }
}