import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { env } from "./config/env.js";
import { registerRoutes } from "./routes/index.js";

export function createApp(): Hono {
  const app = new Hono();

  // ── Global Middleware (order matters) ────────────────────────────────────
  app.use(
    "/*",
    cors({
      origin: (origin, c) => {
        if (c.req.path.startsWith("/api/admin")) return origin || "*";
        const extra = env.EXTRA_ALLOWED_ORIGINS.split(",")
          .map((o) => o.trim())
          .filter(Boolean);
        const allowed = [env.FRONTEND_URL, "http://localhost:8080", ...extra];
        return allowed.includes(origin) ? origin : env.FRONTEND_URL;
      },
      allowHeaders: ["Content-Type", "Authorization", "Cookie"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      exposeHeaders: ["Set-Cookie"],
    })
  );

  app.use("/*", logger());
  app.use("/*", secureHeaders());

  // ── Health Check ─────────────────────────────────────────────────────────
  app.get("/health", (c) =>
    c.json({ ok: true, timestamp: new Date().toISOString() })
  );

  // ── API Routes ────────────────────────────────────────────────────────────
  registerRoutes(app);

  // ── 404 Fallback ─────────────────────────────────────────────────────────
  app.notFound((c) =>
    c.json({ ok: false, error: `Route ${c.req.method} ${c.req.path} not found` }, 404)
  );

  // ── Global Error Handler ─────────────────────────────────────────────────
  app.onError((error, c) => {
    console.error("[app] Unhandled error:", error);
    return c.json({ ok: false, error: "Internal server error" }, 500);
  });

  return app;
}
