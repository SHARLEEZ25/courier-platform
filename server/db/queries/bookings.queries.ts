import { supabase } from "../../config/supabase.js";
import type { DbBooking } from "../../types/db.types.js";

export async function getBookingById(id: string): Promise<DbBooking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as DbBooking;
}

export async function getBookingByRef(ref: string): Promise<DbBooking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_ref", ref)
    .single();

  if (error) return null;
  return data as DbBooking;
}

export async function getBookingsByUser(userId: string): Promise<DbBooking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch bookings: ${error.message}`);
  return (data ?? []) as DbBooking[];
}

export async function createBooking(
  payload: Omit<DbBooking, "id" | "created_at" | "updated_at">
): Promise<DbBooking> {
  const { data, error } = await supabase
    .from("bookings")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`Failed to create booking: ${error.message}`);
  return data as DbBooking;
}

/** Generates a unique booking reference: UNX-2026-XXXXXX */
export function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `UNX-${year}-${rand}`;
}
