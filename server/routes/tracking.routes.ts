import { Hono } from "hono";
import { standardLimiter } from "../middleware/rate-limit.middleware.js";
import { handleGetTracking } from "../controllers/tracking.controller.js";

const trackingRoutes = new Hono();

trackingRoutes.use("/*", standardLimiter);

/**
 * GET /api/tracking/:trackingId
 * Public — accepts tracking number OR booking reference (UNX-YYYY-XXXXXX).
 */
trackingRoutes.get("/:trackingId", handleGetTracking);

export default trackingRoutes;
