import nodemailer from "nodemailer";
import { env } from "../config/env.js";
export function hasMailConfig() {
    return Boolean(env.mailHost && env.mailUser);
}
export const mailer = nodemailer.createTransport({
    host: env.mailHost || undefined,
    port: env.mailPort,
    secure: false,
    auth: env.mailUser ? { user: env.mailUser, pass: env.mailPass } : undefined,
});
