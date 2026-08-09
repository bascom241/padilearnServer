import type { Response, NextFunction } from "express";
import type { ValidateRequestType } from "./authenticate.middleware.js";
import { AppError } from "../error/AppError.js";
import userModel from "../modules/user/user.model.js";
import { UserRole } from "../types/user.types.js";

export interface AuthorizedRequest extends ValidateRequestType {
  currentUser?: { id: string; role: UserRole };
}

// Runs after validateToken. Looks up the user's role (not present in the JWT
// payload) and rejects the request if it isn't one of the allowed roles.
export const requireRole = (...roles: UserRole[]) => {
  return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    try {
      const payload = req.user as { id: string } | undefined;
      if (!payload?.id) {
        throw new AppError("Access denied. No token provided.", 401);
      }

      const user = await userModel.findById(payload.id);
      if (!user) {
        throw new AppError("user not found", 404);
      }

      if (!roles.includes(user.role as UserRole)) {
        throw new AppError(
          "You do not have permission to perform this action",
          403,
        );
      }

      req.currentUser = { id: user._id.toString(), role: user.role as UserRole };
      next();
    } catch (error) {
      next(error);
    }
  };
};
