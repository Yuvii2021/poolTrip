import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/http.js";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    timestamp: new Date().toISOString(),
    message: "Not found",
    status: 404,
  });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "body";
      fieldErrors[key] = issue.message;
    }
    res.status(400).json({
      timestamp: new Date().toISOString(),
      message: err.issues.map((i) => i.message).join(", "),
      errors: fieldErrors,
      status: 400,
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({
      timestamp: new Date().toISOString(),
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
      status: err.status,
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({
    timestamp: new Date().toISOString(),
    message,
    status: 500,
  });
}
