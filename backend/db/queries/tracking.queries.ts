import { sql } from "../../config/db.js";
import type { DbTrackingEvent } from "../../types/db.types.js";

export async function getTrackingEvents(
  trackingNumber: string
): Promise<DbTrackingEvent[]> {
  return sql<DbTrackingEvent[]>`
    SELECT * FROM tracking_events
    WHERE tracking_number = ${trackingNumber}
    ORDER BY event_at ASC
  `;
}

export async function getTrackingEventsByBookingId(
  bookingId: string
): Promise<DbTrackingEvent[]> {
  return sql<DbTrackingEvent[]>`
    SELECT * FROM tracking_events
    WHERE booking_id = ${bookingId}
    ORDER BY event_at ASC
  `;
}

export async function addTrackingEvent(
  event: Omit<DbTrackingEvent, "id" | "created_at">
): Promise<DbTrackingEvent | null> {
  const rows = await sql<DbTrackingEvent[]>`
    INSERT INTO tracking_events ${sql(event)}
    ON CONFLICT (tracking_number, event_code, event_at) DO NOTHING
    RETURNING *
  `;
  return rows[0] ?? null;
}
