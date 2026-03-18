import type { Context } from "hono";
import { getTrackingEvents } from "../db/queries/tracking.queries.js";
import { getBookingByRef } from "../db/queries/bookings.queries.js";
import { ok, err } from "../types/api.types.js";

export async function handleGetTracking(c: Context) {
  const trackingId = c.req.param("trackingId");

  try {
    // Accept both tracking number and booking reference
    const events = await getTrackingEvents(trackingId);

    // If no events, check if it's a valid booking ref
    if (events.length === 0) {
      const booking = await getBookingByRef(trackingId);
      if (!booking) {
        return c.json(
          err("Tracking ID not found. Please check and try again."),
          404
        );
      }

      // Return booking status as a single synthetic event
      return c.json(
        ok({
          trackingId,
          bookingRef: booking.booking_ref,
          carrier: booking.carrier_id,
          status: booking.status,
          events: [
            {
              event_code: booking.status.toUpperCase(),
              description: statusToDescription(booking.status),
              location: "India",
              event_at: booking.created_at,
            },
          ],
        })
      );
    }

    return c.json(
      ok({
        trackingId,
        events,
      })
    );
  } catch (e) {
    console.error("[tracking.controller] getTracking error:", e);
    return c.json(err("Failed to fetch tracking information."), 500);
  }
}

function statusToDescription(status: string): string {
  const map: Record<string, string> = {
    pending: "Booking confirmed. Awaiting pickup.",
    confirmed: "Pickup scheduled.",
    picked_up: "Shipment picked up from sender.",
    in_transit: "Shipment in transit.",
    delivered: "Shipment delivered successfully.",
    cancelled: "Booking cancelled.",
  };
  return map[status] ?? "Status updated.";
}
