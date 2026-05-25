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

export function calculateGirth(dims: Dimensions): number {
  return dims.l + 2 * dims.w + 2 * dims.h;
}

/**
 * Returns the chargeable weight — whichever is greater:
 * the actual weight or the volumetric weight.
 * Rounded up to the nearest 0.5 kg (industry standard).
 */
export function chargeableWeight(
  actualKg: number,
  dims?: Dimensions
): { chargeable: number; volumetric: number | null; girth: number | null } {
  const volumetric = dims ? volumetricWeight(dims) : null;
  const girth = dims ? calculateGirth(dims) : null;

  // Round actual weight first, then compare with volumetric
  const roundedActual = Math.ceil(actualKg * 2) / 2;
  const raw = volumetric !== null ? Math.max(roundedActual, volumetric) : roundedActual;

  // Round chargeable (handles case where volumetric wins and is not on a 0.5 boundary)
  const chargeable = Math.ceil(raw * 2) / 2;

  return { chargeable, volumetric, girth };
}

