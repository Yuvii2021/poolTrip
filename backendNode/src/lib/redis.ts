import { Redis } from "ioredis";
import { env } from "../config/env.js";

export const redis = new Redis({
  host: env.redisHost,
  port: env.redisPort,
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});
