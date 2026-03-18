import { Hono } from "hono";
import { standardLimiter } from "../middleware/rate-limit.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  handleCalculateRates,
  handleGetCarriers,
} from "../controllers/rates.controller.js";
import { RateRequestSchema } from "../../shared/schemas/rate-request.schema.js";

const ratesRoutes = new Hono();

ratesRoutes.use("/*", standardLimiter);

/**
 * POST /api/rates/calculate
 * Body: RateRequest
 * Returns all available carrier rates for the route, sorted by price.
 */
ratesRoutes.post("/calculate", validateBody(RateRequestSchema), handleCalculateRates);

/**
 * GET /api/rates/carriers
 * Returns all active carriers.
 */
ratesRoutes.get("/carriers", handleGetCarriers);

export default ratesRoutes;
