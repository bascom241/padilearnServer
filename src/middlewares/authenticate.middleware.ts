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

// For public endpoints whose response varies for logged-in users (e.g. a
// course's lesson list marking which lessons are locked). Never rejects the
// request — an absent/invalid token just means req.user stays undefined.
export const attemptAuthenticate = (
  req: ValidateRequestType,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  const secretKey = process.env.JWT_SECRET;

  if (token && secretKey) {
    try {
      req.user = jwt.verify(token, secretKey);
    } catch (err) {
      // ignore — treat as anonymous
    }
  }

  next();
};