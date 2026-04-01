import { sql } from "../../config/db.js";
import type { CarrierSlug } from "../../types/rate-engine.types.js";

/** Fallback FSC percentages if DB has no current row. */
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

  const rows = await sql<{ fsc_percent: number }[]>`
    SELECT fsc_percent
    FROM fuel_surcharges
    WHERE carrier_id = ${carrier}
      AND effective_from <= ${today}::date
      AND (effective_to IS NULL OR effective_to >= ${today}::date)
    ORDER BY effective_from DESC
    LIMIT 1
  `;

  if (!rows[0]) return FALLBACK_FSC[carrier] ?? 27.0;
  return Number(rows[0].fsc_percent);
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
