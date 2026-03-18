import { supabase } from "../../config/supabase.js";
import type { CarrierSlug } from "../../types/rate-engine.types.js";

/** Fallback FSC percentages if Supabase has no current row. */
const FALLBACK_FSC: Record<CarrierSlug, number> = {
  dhl: 29.5,
  fedex: 27.0,
  ups: 26.5,
  aramex: 24.0,
};

/**
 * Returns the current fuel surcharge percentage for a carrier.
 * Looks up the active row in `fuel_surcharges` table.
 */
export async function getFscPercent(carrier: CarrierSlug): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("fuel_surcharges")
    .select("fsc_percent")
    .eq("carrier_id", carrier)
    .lte("effective_from", today)
    .or(`effective_to.is.null,effective_to.gte.${today}`)
    .order("effective_from", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return FALLBACK_FSC[carrier] ?? 27.0;
  }

  return Number(data.fsc_percent);
}

/**
 * Applies FSC to a base amount.
 * Returns the FSC amount in INR (not the multiplier).
 */
export function applyFsc(baseInr: number, fscPercent: number): number {
  return round2(baseInr * (fscPercent / 100));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
