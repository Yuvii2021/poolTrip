import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { packageRouter } from "./routes/package.routes.js";
import { bookingRouter } from "./routes/booking.routes.js";
import { subscriberRouter } from "./routes/subscriber.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { optionalAuth } from "./middleware/auth.js";
export const app = express();
app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true,
    exposedHeaders: ["Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
});
app.use("/api/auth", authLimiter);
app.use("/api/auth", authRouter);
app.use("/api", subscriberRouter);
// Public package GET routes; mutating routes require auth.
app.get("/api/packages/*", optionalAuth);
app.use("/api/packages", packageRouter);
app.use("/api/bookings", bookingRouter);
app.get("/healthz", (_req, res) => {
    res.json({ ok: true, service: "backendNode", env: env.nodeEnv });
});
app.use(notFoundHandler);
app.use(errorHandler);
