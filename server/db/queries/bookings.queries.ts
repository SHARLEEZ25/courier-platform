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

/** Generates a unique booking reference: UNX-2026-XXXXXX */
export function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `UNX-${year}-${rand}`;
}
