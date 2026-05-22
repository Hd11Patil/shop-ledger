import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { isProduction } from "../config/env.js";
import { logger } from "../utils/logger.js";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound("Route not found"));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.flatten(),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  const e = err as Error;
  logger.error({ err: e, stack: e.stack }, "Unhandled error");

  return res.status(500).json({
    error: isProduction ? "Internal Server Error" : e.message || "Internal Server Error",
    ...(isProduction ? {} : { stack: e.stack }),
  });
}
