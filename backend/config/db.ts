import postgres from "postgres";
import { env } from "./env.js";

/**
 * postgres.js tagged-template client for Neon.
 * Single instance shared across the process.
 */
export const sql = postgres(env.DATABASE_URL, {
  ssl: "require",
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});
