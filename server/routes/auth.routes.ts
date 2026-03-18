import { Hono } from "hono";
import { auth } from "../auth/better-auth.js";
import { strictLimiter } from "../middleware/rate-limit.middleware.js";

const authRoutes = new Hono();

// Apply strict rate limiting to all auth endpoints
authRoutes.use("/*", strictLimiter);

/**
 * BetterAuth handles all sub-paths internally:
 *   POST /api/auth/sign-in/email
 *   POST /api/auth/sign-up/email
 *   POST /api/auth/sign-out
 *   GET  /api/auth/session
 *   GET  /api/auth/callback/:provider   (OAuth)
 */
authRoutes.on(["POST", "GET"], "/*", (c) => {
  return auth.handler(c.req.raw);
});

export default authRoutes;
