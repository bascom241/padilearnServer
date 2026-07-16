import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../error/AppError.js";

export interface ValidateRequestType extends Request {
  user?: jwt.JwtPayload | string;
}

export const validateToken = (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    throw new AppError("Access denied. No token provided.", 401);
  }

  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined.");
  }

  try {
    const decodedToken = jwt.verify(token, secretKey);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error(err);
    throw new AppError("Invalid token.", 401);
  }
};