import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

declare global {
  namespace Express {
    interface Request {
      userPhone?: string;
      userEmail?: string;
    }
  }
}

type JwtPayload = {
  sub: string;
  Email?: string;
};

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.userPhone = payload.sub;
    req.userEmail = payload.Email;
  } catch {
    // Keep optional behavior to match permissive public routes.
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  optionalAuth(req, res, () => {
    if (!req.userPhone) {
      res.status(401).json({
        timestamp: new Date().toISOString(),
        message: "Unauthorized",
        status: 401,
      });
      return;
    }
    next();
  });
}
