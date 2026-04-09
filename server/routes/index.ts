import type { Hono } from "hono";
import { sql } from "../config/db.js";
import ratesRoutes from "./rates.routes.js";
import bookingsRoutes from "./bookings.routes.js";
import trackingRoutes from "./tracking.routes.js";
import membershipRoutes from "./membership.routes.js";
import pincodeRoutes from "./pincode.routes.js";
import adminRoutes from "./admin.routes.js";

export function registerRoutes(app: Hono) {
  /**
   * GET /api/health
   * Returns server + DB status. Used by UptimeRobot and Render health checks.
   * Response time should be < 200ms — if DB ping is slow, something is wrong.
   */
  app.get("/api/health", async (c) => {
    const start = Date.now();
    try {
      await sql`SELECT 1`;
      return c.json({
        status: "ok",
        db:     "ok",
        ping_ms: Date.now() - start,
        ts:     new Date().toISOString(),
      });
    } catch (e) {
      return c.json({
        status:  "degraded",
        db:      "error",
        ping_ms: Date.now() - start,
        ts:      new Date().toISOString(),
      }, 503);
    }
  });

  app.route("/api/rates", ratesRoutes);
  app.route("/api/bookings", bookingsRoutes);
  app.route("/api/tracking", trackingRoutes);
  app.route("/api/membership", membershipRoutes);
  app.route("/api/pincode", pincodeRoutes);
  app.route("/api/admin", adminRoutes);
}
