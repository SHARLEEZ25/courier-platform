/** IGST rate for international courier services in India. */
const GST_RATE = 0.18;

export interface GstBreakdown {
  subtotal: number;
  gst: number;
  total: number;
}

/**
 * Applies 18% GST to a subtotal amount.
 * Rounds to nearest rupee (standard for GST invoices).
 */
export function applyGst(subtotal: number): GstBreakdown {
  const gst = subtotal * GST_RATE;
  const total = Math.round(subtotal + gst);
  return { subtotal, gst, total };
}
