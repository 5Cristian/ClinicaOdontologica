import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("8h"),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url(),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),
  APP_BASE_URL: z.string().url().default("http://localhost:4000"),
  WHATSAPP_PROVIDER: z.enum(["MANUAL", "TWILIO", "WHATSAPP_WEB"]).default("MANUAL"),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),
  WHATSAPP_WEB_SESSION_PATH: z.string().default(".wwebjs_auth"),
  WHATSAPP_WEB_CHROME_PATH: z.string().optional(),
  WHATSAPP_WEB_AUTO_START: z.enum(["true", "false"]).default("false"),
  WHATSAPP_DEFAULT_COUNTRY_CODE: z.string().regex(/^\d{1,4}$/).default("502"),
  REMINDER_CRON_EXPRESSION: z.string().default("*/15 * * * *"),
  REMINDER_TIMEZONE: z.string().default("America/Guatemala")
});

export const env = envSchema.parse(process.env);
