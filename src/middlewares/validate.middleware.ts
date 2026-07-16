import type { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

// This middleware intercepts incoming traffic and checks it against your Zod schema
export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validates and replaces req.body with clean, sanitized data
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "fail",
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};