import { Router } from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { asyncHandler } from "../utils/http.js";
import {
  authRequestSchema,
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  sendEmailOtpSchema,
  updateMeSchema,
  verifyEmailOtpSchema,
} from "../domain/validators.js";
import { requireAuth } from "../middleware/auth.js";
import * as authService from "../services/auth.service.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(currentDir, "../../tmp");
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });
export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const response = await authService.register(payload);
    res.json(response);
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const payload = authRequestSchema.parse(req.body);
    const response = await authService.login(payload.phone, payload.password);
    res.json(response);
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const response = await authService.getCurrentUser(req.userPhone!);
    res.json(response);
  }),
);

authRouter.put(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = updateMeSchema.parse(req.body);
    const response = await authService.updateCurrentUser(req.userPhone!, payload);
    res.json(response);
  }),
);

authRouter.get(
  "/user/:id",
  asyncHandler(async (req, res) => {
    const response = await authService.getUserById(Number(req.params.id));
    res.json(response);
  }),
);

authRouter.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const payload = forgotPasswordSchema.parse(req.body);
    await authService.forgotPassword(payload.phone);
    res.json({ message: "OTP has been sent to your phone number" });
  }),
);

authRouter.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const payload = resetPasswordSchema.parse(req.body);
    await authService.resetPassword(payload.phone, payload.otp, payload.newPassword);
    res.json({ message: "Password has been reset successfully" });
  }),
);

authRouter.post(
  "/send-otp",
  asyncHandler(async (req, res) => {
    const payload = forgotPasswordSchema.parse(req.body);
    await authService.sendOtpForRegistration(payload.phone);
    res.json({ message: "OTP has been sent to your phone number" });
  }),
);

authRouter.post(
  "/email/send-otp",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = sendEmailOtpSchema.parse(req.body);
    await authService.sendEmailOtp(req.userPhone!, payload.email);
    res.json({ message: "OTP has been sent to your email" });
  }),
);

authRouter.post(
  "/email/verify-otp",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = verifyEmailOtpSchema.parse(req.body);
    await authService.verifyEmailOtp(req.userPhone!, payload.otp);
    res.json({ message: "Email verified successfully" });
  }),
);

authRouter.post(
  "/me/profile-photo",
  requireAuth,
  upload.single("photo"),
  asyncHandler(async (req, res) => {
    const response = await authService.uploadProfilePhoto(req.userPhone!, req.file ?? undefined);
    res.json(response);
  }),
);
