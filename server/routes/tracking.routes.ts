import { Hono } from "hono";
import { standardLimiter } from "../middleware/rate-limit.middleware.js";
import {
  handleGetTracking,
  handleWebhook,
  handleWebhookTest,
} from "../controllers/tracking.controller.js";

const trackingRoutes = new Hono();

trackingRoutes.use("/*", standardLimiter);

/**
 * GET /api/tracking/:trackingId
 * Public — accepts tracking number OR booking reference (UNX-YYYY-XXXXXX).
 */
trackingRoutes.get("/:trackingId", handleGetTracking);

/**
 * POST /api/tracking/webhook
 * AfterShip calls this on every carrier scan event.
 * Verifies HMAC-SHA256 signature if AFTERSHIP_WEBHOOK_SECRET is set.
 * Must respond 200 quickly — processing is async.
 */
trackingRoutes.post("/webhook", handleWebhook);

/**
 * POST /api/tracking/webhook/test
 * Manual test endpoint — simulate any AfterShip event without a real shipment.
 * Disabled in production (returns 403).
 *
 * Body: { tracking_number, tag, message, location? }
 * Tags: Pending | InfoReceived | InTransit | OutForDelivery | Delivered | FailedAttempt | Exception
 */
trackingRoutes.post("/webhook/test", handleWebhookTest);

export default trackingRoutes;
