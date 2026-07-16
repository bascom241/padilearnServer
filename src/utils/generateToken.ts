
import type { TokenPayload, RefreshTokenPayload } from "../types/user.types.js";
import jwt from "jsonwebtoken"

export const generateToken = (payoad:TokenPayload ) => {
    const jwt_token = process.env.JWT_SECRET;
    if(!jwt_token){
        throw new Error("JWT_SECRET is not defined")
    }
    return jwt.sign(payoad, jwt_token, {expiresIn: "15m"});
}


export const genarateRefreshToken = (payload: RefreshTokenPayload) => {
    const refresh_token = process.env.REFRESH_TOKEN_SECRET;
    if(!refresh_token){  
        throw new Error("REFRESH_TOKEN is not defined")
    }
    return jwt.sign(payload, refresh_token, {expiresIn: "7d"})
}


