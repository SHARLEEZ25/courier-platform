/** DIM divisor for international express (industry standard). */
const DIM_DIVISOR = 5000;

export interface Dimensions {
  l: number; // cm
  w: number; // cm
  h: number; // cm
}

/**
 * Calculates volumetric weight in kg.
 * Formula: (L × W × H) / 5000
 */
export function volumetricWeight(dims: Dimensions): number {
  return (dims.l * dims.w * dims.h) / DIM_DIVISOR;
}

/**
 * Returns the chargeable weight — whichever is greater:
 * the actual weight or the volumetric weight.
 * Rounded up to the nearest 0.5 kg (industry standard).
 */
export function chargeableWeight(
  actualKg: number,
  dims?: Dimensions
): { chargeable: number; volumetric: number | null } {
  const volumetric = dims ? volumetricWeight(dims) : null;
  const raw = volumetric !== null ? Math.max(actualKg, volumetric) : actualKg;

  // Round up to nearest 0.5 kg
  const chargeable = Math.ceil(raw * 2) / 2;

  return { chargeable, volumetric };
}
