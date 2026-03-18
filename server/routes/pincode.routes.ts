import { Hono } from "hono";
import { z } from "zod";
import { validateBody } from "../middleware/validate.middleware.js";
import { handlePincodeLookup } from "../controllers/pincode.controller.js";

const PincodeLookupSchema = z.object({
  pincode: z.string().regex(/^\d{6}$/, "Must be a 6-digit pincode"),
});

const pincodeRoutes = new Hono();

/**
 * POST /api/pincode/lookup
 * Body: { pincode: "600001" }
 * Returns: { serviceable: true, city, surchargeInr, tier } | { serviceable: false }
 */
pincodeRoutes.post(
  "/lookup",
  validateBody(PincodeLookupSchema),
  handlePincodeLookup
);

export default pincodeRoutes;
