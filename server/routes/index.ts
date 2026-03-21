import type { Hono } from "hono";
import ratesRoutes from "./rates.routes.js";
import bookingsRoutes from "./bookings.routes.js";
import trackingRoutes from "./tracking.routes.js";
import membershipRoutes from "./membership.routes.js";
import pincodeRoutes from "./pincode.routes.js";

export function registerRoutes(app: Hono) {
  app.route("/api/rates", ratesRoutes);
  app.route("/api/bookings", bookingsRoutes);
  app.route("/api/tracking", trackingRoutes);
  app.route("/api/membership", membershipRoutes);
  app.route("/api/pincode", pincodeRoutes);
}
