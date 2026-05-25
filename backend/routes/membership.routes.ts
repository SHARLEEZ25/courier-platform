import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.middleware.js";
import { standardLimiter } from "../middleware/rate-limit.middleware.js";
import {
  handleGetPlans,
  handleSubscribe,
  handleGetMembershipStatus,
} from "../controllers/membership.controller.js";

const membershipRoutes = new Hono();

membershipRoutes.use("/*", standardLimiter);

/**
 * GET /api/membership/plans
 * Public — lists all available membership plans.
 */
membershipRoutes.get("/plans", handleGetPlans);

/**
 * POST /api/membership/subscribe
 * Auth required — subscribes the user to a plan.
 * Body: { planId: "silver" | "gold" }
 */
membershipRoutes.post("/subscribe", requireAuth, handleSubscribe);

/**
 * GET /api/membership/status
 * Auth required — returns the user's active membership, if any.
 */
membershipRoutes.get("/status", requireAuth, handleGetMembershipStatus);

export default membershipRoutes;
