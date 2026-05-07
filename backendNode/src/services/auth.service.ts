import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/http.js";
import { userPublic } from "../domain/mappers.js";
import { hasMailConfig, mailer } from "../lib/mailer.js";
import { hasCloudinaryConfig, cloudinary } from "../lib/cloudinary.js";

const DEMO_MODE = true;

type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  Otp: string;
  whatsappNumber?: string;
};

export function signToken(email: string, phone: string): string {
  return jwt.sign({ Email: email }, env.jwtSecret, {
    subject: phone,
    expiresIn: Math.floor(env.jwtExpirationMs / 1000),
  });
}

async function verifyPhoneOtp(phone: string, otp: string): Promise<void> {
  if (DEMO_MODE) return;
  const record = await prisma.otpVerification.findFirst({
    where: { phone },
    orderBy: { expiresAt: "desc" },
  });
  if (!record) throw new ApiError(400, "OTP not found");
  if (record.expiresAt < new Date()) throw new ApiError(400, "OTP expired");
  if (record.otp !== otp) throw new ApiError(400, "Invalid OTP");
  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { verified: true },
  });
}

export async function register(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new ApiError(400, "Email already exists");
  const existingPhone = await prisma.user.findUnique({ where: { phone } });
  if (existingPhone) throw new ApiError(400, "Number already exists");

  await verifyPhoneOtp(phone, input.Otp.trim());
  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      fullName: input.fullName.trim(),
      phone,
      whatsappNumber: input.whatsappNumber?.trim() || null,
      phoneVerified: true,
      emailVerified: false,
    },
  });

  return {
    token: signToken(user.email, user.phone),
    userId: Number(user.id),
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    whatsappNumber: user.whatsappNumber,
    role: "USER",
  };
}

export async function login(phone: string, password: string) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new ApiError(401, "Invalid email or password");
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new ApiError(401, "Invalid email or password");

  return {
    token: signToken(user.email, user.phone),
    userId: Number(user.id),
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    whatsappNumber: user.whatsappNumber,
    role: "USER",
  };
}

export async function getCurrentUser(phone: string) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new ApiError(400, "User not found");
  return userPublic(user);
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({ where: { id: BigInt(id) } });
  if (!user) throw new ApiError(400, "User not found");
  const payload = userPublic(user);
  return {
    id: payload.id,
    fullName: payload.fullName,
    phone: payload.phone,
    whatsappNumber: payload.whatsappNumber,
    bio: payload.bio,
    rating: payload.rating,
    reviewCount: payload.reviewCount,
    numberOfTrips: payload.numberOfTrips,
    profilePhoto: payload.profilePhoto,
    phoneVerified: payload.phoneVerified,
    emailVerified: payload.emailVerified,
  };
}

export async function updateCurrentUser(
  phone: string,
  updates: { fullName?: string; email?: string; whatsappNumber?: string; bio?: string },
) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new ApiError(400, "User not found");

  const patch: Record<string, unknown> = {};
  if (updates.fullName?.trim()) patch.fullName = updates.fullName.trim();
  if (updates.whatsappNumber?.trim()) patch.whatsappNumber = updates.whatsappNumber.trim();
  if (updates.bio !== undefined) patch.bio = updates.bio.trim() || null;
  if (updates.email?.trim()) {
    const email = updates.email.trim().toLowerCase();
    if (email !== user.email.toLowerCase()) {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) throw new ApiError(400, "Email already in use by another account");
      patch.email = email;
      patch.emailVerified = false;
    }
  }

  const saved = await prisma.user.update({
    where: { id: user.id },
    data: patch,
  });
  return userPublic(saved);
}

export async function sendOtpForRegistration(phone: string) {
  const otp = String(100000 + Math.floor(Math.random() * 900000));
  await prisma.otpVerification.create({
    data: {
      phone,
      otp,
      verified: false,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });
}

export async function forgotPassword(phone: string) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new ApiError(400, "User not found with this phone number");
  await sendOtpForRegistration(phone);
}

export async function resetPassword(phone: string, otp: string, newPassword: string) {
  await verifyPhoneOtp(phone, otp);
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new ApiError(400, "User not found");
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash },
  });
}

function otpKey(fullName: string, email: string): string {
  return `otp:email:${fullName.trim().toLowerCase().replace(/\s+/g, "_")}_${email.trim().toLowerCase()}`;
}

export async function sendEmailOtp(phone: string, email: string) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new ApiError(400, "User not found");
  const normalized = email.trim().toLowerCase();
  if (normalized !== user.email.toLowerCase()) {
    throw new ApiError(400, "Email does not match your account email");
  }

  const otp = String(100000 + Math.floor(Math.random() * 900000));
  await redis.connect().catch(() => undefined);
  await redis.set(otpKey(user.fullName, normalized), otp, "EX", 300).catch(() => undefined);

  if (hasMailConfig()) {
    await mailer.sendMail({
      from: env.mailFrom,
      to: normalized,
      subject: "PoolMyTrips - Email Verification OTP",
      text: `Your PoolMyTrips email verification OTP is: ${otp}\n\nThis OTP will expire in 5 minutes.`,
    });
  }
}

export async function verifyEmailOtp(phone: string, otp: string) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new ApiError(400, "User not found");
  await redis.connect().catch(() => undefined);
  const key = otpKey(user.fullName, user.email);
  const expected = await redis.get(key).catch(() => null);
  if (!expected || expected !== otp.trim()) throw new ApiError(400, "Invalid or expired OTP");
  await redis.del(key).catch(() => undefined);
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });
}

export async function uploadProfilePhoto(phone: string, file?: Express.Multer.File) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new ApiError(400, "User not found");
  if (!file) throw new ApiError(400, "Photo is required");
  if (!hasCloudinaryConfig()) {
    throw new ApiError(400, "Cloudinary is not configured");
  }

  const uploaded = await cloudinary.uploader.upload(file.path, {
    folder: `poolmytrips/${user.id.toString()}/profile`,
    resource_type: "auto",
  });
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { profilePhoto: uploaded.secure_url },
  });

  return {
    profilePhoto: updated.profilePhoto,
    emailVerified: updated.emailVerified,
    phoneVerified: updated.phoneVerified ?? true,
  };
}
