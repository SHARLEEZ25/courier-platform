import { sql } from "../../config/db.js";
import type { DbBooking } from "../../types/db.types.js";

export async function getBookingById(id: string): Promise<DbBooking | null> {
  const rows = await sql<DbBooking[]>`
    SELECT * FROM bookings WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getBookingByRef(ref: string): Promise<DbBooking | null> {
  const rows = await sql<DbBooking[]>`
    SELECT * FROM bookings WHERE booking_ref = ${ref} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getBookingByTrackingNumber(trackingNumber: string): Promise<DbBooking | null> {
  const rows = await sql<DbBooking[]>`
    SELECT * FROM bookings WHERE tracking_number = ${trackingNumber} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function updateTrackingNumber(
  bookingId: string,
  trackingNumber: string
): Promise<DbBooking | null> {
  const rows = await sql<DbBooking[]>`
    UPDATE bookings
    SET tracking_number = ${trackingNumber}, status = 'confirmed', updated_at = NOW()
    WHERE id = ${bookingId}
    RETURNING *
  `;
  return rows[0] ?? null;
}

export async function getBookingsByUser(userId: string): Promise<DbBooking[]> {
  return sql<DbBooking[]>`
    SELECT * FROM bookings
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
}

export async function createBooking(
  payload: Omit<DbBooking, "id" | "created_at" | "updated_at">
): Promise<DbBooking> {
  const rows = await sql<DbBooking[]>`
    INSERT INTO bookings ${sql(payload)}
    RETURNING *
  `;
  if (!rows[0]) throw new Error("Failed to create booking");
  return rows[0];
}

/**
 * Updates booking status — only moves forward, never backward.
 * Order: pending(0) → confirmed(1) → picked_up(2) → in_transit(3) → delivered(4)
 * cancelled can be set from any state.
 */
const STATUS_ORDER: Record<string, number> = {
  pending: 0, confirmed: 1, picked_up: 2, in_transit: 3, delivered: 4, cancelled: 99,
};

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string
): Promise<DbBooking | null> {
  // Fetch current status first so we don't regress
  const current = await getBookingById(bookingId);
  if (!current) return null;

  const currentOrder = STATUS_ORDER[current.status] ?? 0;
  const newOrder     = STATUS_ORDER[newStatus] ?? 0;

  // Only update if new status is further along (or cancelled)
  if (newStatus !== "cancelled" && newOrder <= currentOrder) return current;

  const rows = await sql<DbBooking[]>`
    UPDATE bookings
    SET status = ${newStatus}, updated_at = NOW()
    WHERE id = ${bookingId}
    RETURNING *
  `;
  return rows[0] ?? null;
}

/** Generates a unique booking reference: UNX-2026-XXXXXX */
export function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `UNX-${year}-${rand}`;
}

export interface GetAllBookingsFilters {
  status?: string;
  carrier_id?: string;
  q?: string;           // search by booking_ref or tracking_number
  from?: string;        // ISO date string
  to?: string;          // ISO date string
  origin?: string;      // origin_country partial match
  destination?: string; // destination_country partial match
  limit?: number;
  offset?: number;
}

/**
 * Admin: list all bookings with optional filters and pagination.
 * Returns bookings newest-first plus a total count.
 */
export async function getAllBookings(
  filters: GetAllBookingsFilters = {}
): Promise<{ bookings: DbBooking[]; total: number }> {
  const { status, carrier_id, q, from, to, origin, destination, limit = 50, offset = 0 } = filters;

  // Build WHERE clauses dynamically
  const conditions: ReturnType<typeof sql>[] = [];

  if (status) {
    conditions.push(sql`status = ${status}`);
  }
  if (carrier_id) {
    conditions.push(sql`carrier_id = ${carrier_id}`);
  }
  if (q) {
    conditions.push(sql`(booking_ref ILIKE ${"%" + q + "%"} OR tracking_number ILIKE ${"%" + q + "%"})`);
  }
  if (from) {
    conditions.push(sql`created_at >= ${from}::timestamptz`);
  }
  if (to) {
    conditions.push(sql`created_at < (${to}::date + INTERVAL '1 day')`);
  }
  if (origin) {
    conditions.push(sql`origin_country ILIKE ${"%" + origin + "%"}`);
  }
  if (destination) {
    conditions.push(sql`destination_country ILIKE ${"%" + destination + "%"}`);
  }

  const whereClause =
    conditions.length > 0
      ? sql`WHERE ${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)}`
      : sql``;

  const [rows, countRows] = await Promise.all([
    sql<DbBooking[]>`
      SELECT * FROM bookings
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
    sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count FROM bookings ${whereClause}
    `,
  ]);

  return {
    bookings: rows,
    total: Number(countRows[0]?.count ?? 0),
  };
}
