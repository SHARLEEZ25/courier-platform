import type { Context } from "hono";
import { getBookingByRef, getBookingByTrackingNumber } from "../db/queries/bookings.queries.js";
import { addTrackingEvent, getTrackingEvents } from "../db/queries/tracking.queries.js";
import { fetchTracking, tagToStatus, registerTracking } from "../services/aftership.js";
import { ok, err } from "../types/api.types.js";
import { env } from "../config/env.js";

export async function handleGetTracking(c: Context) {
  const trackingId = (c.req.param("trackingId") ?? "").trim().toUpperCase();

  try {
    // Resolve: is this a booking ref (UNX-...) or a carrier tracking number?
    let booking = trackingId.startsWith("UNX-")
      ? await getBookingByRef(trackingId)
      : await getBookingByTrackingNumber(trackingId);

    // If given a tracking number directly but not found, also try as booking ref
    if (!booking && !trackingId.startsWith("UNX-")) {
      booking = await getBookingByRef(trackingId);
    }

    if (!booking) {
      return c.json(err("Tracking ID not found. Please check and try again."), 404);
    }

    // No carrier tracking number yet — return synthetic pending event
    if (!booking.tracking_number) {
      return c.json(ok({
        trackingId,
        bookingRef: booking.booking_ref,
        carrier: booking.carrier_id,
        status: booking.status,
        events: [{
          event_code: booking.status.toUpperCase(),
          description: statusToDescription(booking.status),
          location: "India",
          event_at: booking.created_at,
        }],
      }));
    }

    // We have a tracking number — call AfterShip if API key is configured
    if (env.AFTERSHIP_API_KEY) {
      const aftership = await fetchTracking(booking.carrier_id, booking.tracking_number).catch((e) => {
        console.error("[tracking] AfterShip fetch error:", e.message);
        return null;
      });

      if (aftership) {
        // Sync new checkpoints to our DB (fire-and-forget, don't block response)
        syncCheckpoints(booking.id, booking.tracking_number, aftership.checkpoints).catch(() => {});

        const status = tagToStatus(aftership.tag);
        const events = aftership.checkpoints.map((cp) => ({
          event_code: cp.tag,
          description: cp.message,
          location: cp.location ?? cp.city ?? cp.country_name ?? null,
          event_at: cp.checkpoint_time || cp.created_at,
        }));

        return c.json(ok({
          trackingId,
          bookingRef: booking.booking_ref,
          carrier: booking.carrier_id,
          status,
          events: events.length > 0 ? events : [{
            event_code: "INFO_RECEIVED",
            description: "Tracking registered. Awaiting first carrier scan.",
            location: "India",
            event_at: booking.created_at,
          }],
        }));
      }
    }

    // Fallback: serve from our local tracking_events table
    const events = await getTrackingEvents(booking.tracking_number);
    return c.json(ok({
      trackingId,
      bookingRef: booking.booking_ref,
      carrier: booking.carrier_id,
      status: booking.status,
      events: events.length > 0
        ? events.map((e) => ({
            event_code: e.event_code,
            description: e.description,
            location: e.location,
            event_at: e.event_at,
          }))
        : [{
            event_code: booking.status.toUpperCase(),
            description: statusToDescription(booking.status),
            location: "India",
            event_at: booking.created_at,
          }],
    }));

  } catch (e) {
    console.error("[tracking.controller] error:", e);
    return c.json(err("Failed to fetch tracking information."), 500);
  }
}

/**
 * PATCH /api/bookings/:id/tracking
 * Staff-only: assign a carrier tracking number to a booking and register it with AfterShip.
 */
export async function handleAssignTracking(c: Context) {
  const bookingId = c.req.param("id") ?? "";
  const body = await c.req.json<{ tracking_number: string }>().catch(() => null);

  if (!body?.tracking_number?.trim()) {
    return c.json(err("tracking_number is required"), 400);
  }

  const trackingNumber = body.tracking_number.trim();

  try {
    const { updateTrackingNumber } = await import("../db/queries/bookings.queries.js");
    const booking = await updateTrackingNumber(bookingId, trackingNumber);

    if (!booking) {
      return c.json(err("Booking not found"), 404);
    }

    // Register with AfterShip in the background
    if (env.AFTERSHIP_API_KEY) {
      registerTracking(booking.carrier_id, trackingNumber, booking.booking_ref).catch((e) => {
        console.error("[tracking] AfterShip register error:", e.message);
      });
    }

    return c.json(ok({ booking_ref: booking.booking_ref, tracking_number: trackingNumber }));
  } catch (e) {
    console.error("[tracking.controller] assignTracking error:", e);
    return c.json(err("Failed to assign tracking number"), 500);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusToDescription(status: string): string {
  const map: Record<string, string> = {
    pending:    "Booking confirmed. Awaiting pickup.",
    confirmed:  "Pickup scheduled.",
    picked_up:  "Shipment picked up from sender.",
    in_transit: "Shipment in transit.",
    delivered:  "Shipment delivered successfully.",
    cancelled:  "Booking cancelled.",
  };
  return map[status] ?? "Status updated.";
}

async function syncCheckpoints(
  bookingId: string,
  trackingNumber: string,
  checkpoints: { checkpoint_time: string; created_at: string; message: string; location: string | null; city: string | null; country_name: string | null; tag: string }[]
) {
  for (const cp of checkpoints) {
    await addTrackingEvent({
      booking_id: bookingId,
      tracking_number: trackingNumber,
      event_code: cp.tag,
      description: cp.message,
      location: cp.location ?? cp.city ?? cp.country_name ?? null,
      event_at: cp.checkpoint_time || cp.created_at,
    }).catch(() => {});
  }
}
