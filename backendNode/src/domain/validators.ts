import { z } from "zod";

const indianPhone = /^[6-9][0-9]{9}$/;

export const authRequestSchema = z.object({
  phone: z.string().regex(indianPhone, "Phone number must be a valid 10-digit Indian mobile number"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().regex(indianPhone, "Phone number must be a valid 10-digit Indian mobile number"),
  Otp: z.string().min(1, "Otp is required"),
  whatsappNumber: z.string().regex(indianPhone, "Phone number must be a valid 10-digit Indian mobile number").optional(),
});

export const updateMeSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email("Invalid email format").optional(),
  whatsappNumber: z.string().regex(indianPhone, "Phone number must be a valid 10-digit Indian mobile number").optional(),
  bio: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  phone: z.string().regex(indianPhone, "Phone number must be a valid 10-digit Indian mobile number"),
});

export const resetPasswordSchema = z.object({
  phone: z.string().regex(indianPhone, "Phone number must be a valid 10-digit Indian mobile number"),
  otp: z.string().min(1),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const sendEmailOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const verifyEmailOtpSchema = z.object({
  otp: z.string().min(1),
});

export const packageQuerySchema = z.object({
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  days: z.coerce.number().optional(),
  minDays: z.coerce.number().optional(),
  maxDays: z.coerce.number().optional(),
  transportation: z.string().optional(),
  featured: z.coerce.boolean().optional(),
});

export const subscribeSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const bookingCreateSchema = z.object({
  packageId: z.coerce.number().int().positive(),
  seats: z.coerce.number().int().positive().optional(),
  message: z.string().optional(),
});

export const bookingRatingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().optional(),
});
