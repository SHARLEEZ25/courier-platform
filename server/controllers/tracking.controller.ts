import type { Context } from "hono";
import { createHmac } from "crypto";
import { getBookingByRef, getBookingByTrackingNumber, updateBookingStatus } from "../db/queries/bookings.queries.js";
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

/**
 * POST /api/tracking/webhook
 * AfterShip calls this every time a tracking event happens.
 * Verifies the HMAC-SHA256 signature if AFTERSHIP_WEBHOOK_SECRET is set.
 * Writes new checkpoints to tracking_events and advances booking status.
 *
 * AfterShip expects a 200 back quickly — any non-200 triggers a retry.
 * All heavy work is fire-and-forget so we respond in < 100ms.
 */
export async function handleWebhook(c: Context) {
  // Read raw body first — needed for signature verification
  const rawBody = await c.req.text();

  // Verify AfterShip signature when secret is configured
  if (env.AFTERSHIP_WEBHOOK_SECRET) {
    const signature = c.req.header("aftership-hmac-sha256") ?? "";
    const expected  = createHmac("sha256", env.AFTERSHIP_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("base64");

    if (signature !== expected) {
      console.warn("[webhook] Invalid AfterShip signature — request rejected");
      return c.json(err("Invalid signature"), 401);
    }
  }

  let payload: AfterShipWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as AfterShipWebhookPayload;
  } catch {
    return c.json(err("Invalid JSON"), 400);
  }

  // We only care about tracking updates
  if (payload.event !== "tracking_update") {
    return c.json(ok({ received: true, action: "ignored", reason: "event type not tracking_update" }));
  }

  const { tracking_number, slug, tag, checkpoints } = payload.msg;

  if (!tracking_number) {
    return c.json(err("Missing tracking_number in payload"), 400);
  }

  // Respond 200 immediately — process async so AfterShip doesn't time out
  c.executionCtx?.waitUntil(
    processWebhookPayload(tracking_number, slug, tag, checkpoints ?? []).catch((e) =>
      console.error("[webhook] processWebhookPayload error:", e)
    )
  );

  // If waitUntil not available (non-edge runtime), fire-and-forget
  if (!c.executionCtx?.waitUntil) {
    processWebhookPayload(tracking_number, slug, tag, checkpoints ?? []).catch((e) =>
      console.error("[webhook] processWebhookPayload error:", e)
    );
  }

  return c.json(ok({ received: true }));
}

/**
 * POST /api/tracking/webhook/test
 * Manual test endpoint — lets you simulate any AfterShip event without a real shipment.
 * Disabled in production.
 *
 * Body: { tracking_number, tag, message, location }
 * tag values: Pending | InfoReceived | InTransit | OutForDelivery | Delivered | FailedAttempt | Exception
 *
 * Example curl:
 *   curl -X POST https://your-backend.onrender.com/api/tracking/webhook/test \
 *     -H "Content-Type: application/json" \
 *     -d '{"tracking_number":"1Z999AA10123456784","tag":"InTransit","message":"Arrived at Dubai Hub","location":"Dubai, UAE"}'
 */
export async function handleWebhookTest(c: Context) {
  if (env.NODE_ENV === "production") {
    return c.json(err("Test endpoint disabled in production"), 403);
  }

  const body = await c.req.json<{
    tracking_number: string;
    tag: string;
    message: string;
    location?: string;
  }>().catch(() => null);

  if (!body?.tracking_number || !body?.tag || !body?.message) {
    return c.json(err("Required fields: tracking_number, tag, message"), 400);
  }

  const checkpoint: AfterShipCheckpointRaw = {
    tag:              body.tag,
    message:          body.message,
    location:         body.location ?? null,
    city:             null,
    country_name:     null,
    checkpoint_time:  new Date().toISOString(),
    created_at:       new Date().toISOString(),
  };

  const result = await processWebhookPayload(
    body.tracking_number,
    "test",
    body.tag,
    [checkpoint]
  );

  if (!result) {
    return c.json(err(`No booking found for tracking number: ${body.tracking_number}`), 404);
  }

  return c.json(ok({
    received:        true,
    booking_ref:     result.booking_ref,
    new_status:      result.status,
    event_written:   true,
  }));
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

/**
 * Core logic shared by both the real webhook and the test endpoint.
 * Looks up the booking, writes checkpoint events, advances booking status.
 * Returns the updated booking or null if booking not found.
 */
async function processWebhookPayload(
  trackingNumber: string,
  _slug: string,
  tag: string,
  checkpoints: AfterShipCheckpointRaw[]
) {
  const booking = await getBookingByTrackingNumber(trackingNumber);
  if (!booking) {
    console.warn(`[webhook] No booking found for tracking number: ${trackingNumber}`);
    return null;
  }

  // Write each checkpoint to tracking_events (ON CONFLICT DO NOTHING is in the query)
  for (const cp of checkpoints) {
    await addTrackingEvent({
      booking_id:      booking.id,
      tracking_number: trackingNumber,
      event_code:      cp.tag,
      description:     cp.message,
      location:        cp.location ?? cp.city ?? cp.country_name ?? null,
      event_at:        cp.checkpoint_time || cp.created_at,
    }).catch(() => {});
  }

  // Advance booking status based on the overall tag AfterShip reports
  const newStatus = tagToStatus(tag);
  const updated   = await updateBookingStatus(booking.id, newStatus).catch(() => booking);

  console.log(`[webhook] ${trackingNumber} → tag=${tag} status=${updated?.status ?? booking.status} checkpoints=${checkpoints.length}`);
  return updated ?? booking;
}

// ── AfterShip payload types (internal) ───────────────────────────────────────

interface AfterShipCheckpointRaw {
  checkpoint_time: string;
  created_at:      string;
  message:         string;
  location:        string | null;
  city:            string | null;
  country_name:    string | null;
  tag:             string;
}

interface AfterShipWebhookPayload {
  event: string;
  msg: {
    tracking_number: string;
    slug:            string;
    tag:             string;
    checkpoints:     AfterShipCheckpointRaw[];
  };
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
