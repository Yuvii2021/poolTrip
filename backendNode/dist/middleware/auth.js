import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function optionalAuth(req, _res, next) {
    const authHeader = req.header("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        next();
        return;
    }
    try {
        const token = authHeader.slice(7);
        const payload = jwt.verify(token, env.jwtSecret);
        req.userPhone = payload.sub;
        req.userEmail = payload.Email;
    }
    catch {
        // Keep optional behavior to match permissive public routes.
    }
    next();
}
export function requireAuth(req, res, next) {
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
