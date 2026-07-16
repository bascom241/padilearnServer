import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../error/AppError.js";

interface ErrorItem {
    field?: string | undefined;
    message: string;
}

const sendError = (
  req: Request,
  res: Response,
  status: number,
  code: string,
  message: string,
  errors: ErrorItem[] = []
) => {
  return res.status(status).json({
    success: false,
    status,
    code,
    message,
    errors,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error(" ERROR INTERCEPTED");
  console.error(err);

  /**
   * Custom Application Errors
   */
  if (err instanceof AppError) {
    return sendError(
      req,
      res,
      err.statusCode,
      "APP_ERROR",
      err.message
    );
  }

  /**
   * Zod Validation Errors
   */
  if (err instanceof ZodError) {
    return sendError(
      req,
      res,
      400,
      "VALIDATION_ERROR",
      "Validation failed",
      err.issues.map(issue => ({
        field: issue.path.join("."),
        message: issue.message,
      }))
    );
  }

  /**
   * Mongo Duplicate Key
   */
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];

    return sendError(
      req,
      res,
      409,
      "DUPLICATE_RESOURCE",
      `${field} already exists.`,
      [
        {
          field,
          message: `${field} already exists.`,
        },
      ]
    );
  }

  /**
   * Invalid JSON Body
   */
  if (
    err instanceof SyntaxError &&
    "status" in err &&
    (err as any).status === 400 &&
    "body" in err
  ) {
    return sendError(
      req,
      res,
      400,
      "INVALID_JSON",
      "Malformed JSON payload."
    );
  }

  /**
   * Unknown Errors
   */
  const isDevelopment = process.env.NODE_ENV === "development";

  return sendError(
    req,
    res,
    500,
    "INTERNAL_SERVER_ERROR",
    isDevelopment
      ? err.message
      : "Something went wrong on our server."
  );
};