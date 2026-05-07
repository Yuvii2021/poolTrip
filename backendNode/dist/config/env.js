import "dotenv/config";
function must(name, fallback) {
    const value = process.env[name] ?? fallback;
    if (!value || value.trim().length === 0) {
        throw new Error(`Missing required env var: ${name}`);
    }
    return value;
}
function num(name, fallback) {
    const raw = process.env[name];
    if (!raw)
        return fallback;
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
        throw new Error(`Invalid numeric env var: ${name}`);
    }
    return parsed;
}
export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: num("PORT", 8091),
    appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:8091",
    frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? "http://localhost:5173",
    jwtSecret: must("JWT_SECRET"),
    jwtExpirationMs: num("JWT_EXPIRATION_MS", 86_400_000),
    redisHost: process.env.REDIS_HOST ?? "127.0.0.1",
    redisPort: num("REDIS_PORT", 6379),
    mailHost: process.env.MAIL_HOST ?? "",
    mailPort: num("MAIL_PORT", 587),
    mailUser: process.env.MAIL_USER ?? "",
    mailPass: process.env.MAIL_PASS ?? "",
    mailFrom: process.env.MAIL_FROM ?? process.env.MAIL_USER ?? "",
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
};
export const isProduction = env.nodeEnv === "production";
