import { rateLimiter } from "hono-rate-limiter";

/**
 * Standard rate limiter: 60 requests / minute per IP.
 * Apply to public, unauthenticated endpoints.
 */
export const standardLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-6",
  keyGenerator: (c) =>
    c.req.header("x-forwarded-for") ??
    c.req.header("x-real-ip") ??
    "unknown",
});

/**
 * Strict rate limiter: 10 requests / minute per IP.
 * Apply to auth endpoints to slow brute-force attempts.
 */
export const strictLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-6",
  keyGenerator: (c) =>
    c.req.header("x-forwarded-for") ??
    c.req.header("x-real-ip") ??
    "unknown",
});
