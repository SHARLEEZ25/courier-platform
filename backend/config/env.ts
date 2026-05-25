import { z } from "zod";
import "dotenv/config";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID is required"),
  FIREBASE_CLIENT_EMAIL: z.string().min(1, "FIREBASE_CLIENT_EMAIL is required"),
  FIREBASE_PRIVATE_KEY: z.string().min(1, "FIREBASE_PRIVATE_KEY is required"),
  FRONTEND_URL: z.string().url().default("http://localhost:8080"),
  AFTERSHIP_API_KEY: z.string().default(""),
  // Set this in AfterShip dashboard → Settings → Notifications → Webhook → Secret
  // Used to verify every inbound webhook request is genuinely from AfterShip
  AFTERSHIP_WEBHOOK_SECRET: z.string().default(""),
  // Comma-separated Firebase UIDs that have admin access, e.g. "uid1,uid2"
  ADMIN_UIDS: z.string().default(""),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const msgs = parsed.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join(", ");
  throw new Error(`Invalid environment variables — ${msgs}`);
}

export const env = parsed.data;
