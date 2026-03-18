import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { standardLimiter } from "../middleware/rate-limit.middleware.js";
import {
  handleCreateBooking,
  handleGetBooking,
  handleListBookings,
} from "../controllers/bookings.controller.js";
import { BookingCreateSchema } from "../../shared/schemas/booking.schema.js";

const bookingsRoutes = new Hono();

bookingsRoutes.use("/*", standardLimiter);

/**
 * POST /api/bookings
 * Auth optional (supports guest bookings).
 * Recalculates rate server-side before saving.
 */
bookingsRoutes.post(
  "/",
  validateBody(BookingCreateSchema),
  handleCreateBooking
);

/**
 * GET /api/bookings
 * Auth required — lists the current user's bookings.
 */
bookingsRoutes.get("/", requireAuth, handleListBookings);

/**
 * GET /api/bookings/:id
 * Auth required — returns a single booking by ID.
 */
bookingsRoutes.get("/:id", requireAuth, handleGetBooking);

export default bookingsRoutes;
