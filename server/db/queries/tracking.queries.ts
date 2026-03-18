import { supabase } from "../../config/supabase.js";
import type { DbTrackingEvent } from "../../types/db.types.js";

export async function getTrackingEvents(
  trackingNumber: string
): Promise<DbTrackingEvent[]> {
  const { data, error } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("tracking_number", trackingNumber)
    .order("event_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch tracking events: ${error.message}`);
  return (data ?? []) as DbTrackingEvent[];
}

export async function addTrackingEvent(
  event: Omit<DbTrackingEvent, "id" | "created_at">
): Promise<DbTrackingEvent> {
  const { data, error } = await supabase
    .from("tracking_events")
    .insert(event)
    .select()
    .single();

  if (error) throw new Error(`Failed to add tracking event: ${error.message}`);
  return data as DbTrackingEvent;
}
