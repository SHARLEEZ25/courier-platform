/**
 * AfterShip Tracking API client (2024-10).
 * Docs: https://www.aftership.com/docs/tracking/2024-10/quickstart
 *
 * Auth: as-api-key header (admin API key, asat_ prefix)
 * Base: https://api.aftership.com/tracking/2024-10
 */

import { env } from "../config/env.js";

const BASE = "https://api.aftership.com/tracking/2024-10";

// Map our carrier slugs → AfterShip slugs
const CARRIER_SLUG: Record<string, string> = {
  dhl:   "dhl",
  fedex: "fedex",
  ups:   "ups",
};

// Map AfterShip tag → our internal booking status
const TAG_TO_STATUS: Record<string, string> = {
  Pending:        "pending",
  InfoReceived:   "pending",
  InTransit:      "in_transit",
  OutForDelivery: "in_transit",
  AttemptFail:    "in_transit",
  FailedAttempt:  "in_transit",
  Exception:      "in_transit",
  Expired:        "in_transit",
  Delivered:      "delivered",
};

export interface AfterShipCheckpoint {
  checkpoint_time: string;
  created_at: string;
  message: string;
  location: string | null;
  country_name: string | null;
  city: string | null;
  tag: string;
  subtag: string;
}

export interface AfterShipTracking {
  id: string;
  tracking_number: string;
  slug: string;
  tag: string;
  checkpoints: AfterShipCheckpoint[];
}

function headers() {
  return {
    "as-api-key": env.AFTERSHIP_API_KEY,
    "Content-Type": "application/json",
  };
}

/**
 * Register a tracking number with AfterShip.
 * Safe to call multiple times — 4003 (already exists) is treated as success.
 */
export async function registerTracking(
  carrier: string,
  trackingNumber: string,
  bookingRef?: string
): Promise<void> {
  const slug = CARRIER_SLUG[carrier] ?? carrier;

  const body: Record<string, unknown> = { tracking_number: trackingNumber, slug };
  if (bookingRef) body.order_id = bookingRef;

  const res = await fetch(`${BASE}/trackings`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  const json = await res.json() as { meta: { code: number; message: string } };

  // 201 = created, 4003 = already exists — both fine
  if (json.meta.code !== 201 && json.meta.code !== 4003) {
    throw new Error(`AfterShip register failed (${json.meta.code}): ${json.meta.message}`);
  }
}

/**
 * Fetch the latest tracking data for a shipment from AfterShip.
 * Queries by tracking_number + slug (no need to store AfterShip's internal ID).
 * Returns null if not found.
 */
export async function fetchTracking(
  carrier: string,
  trackingNumber: string
): Promise<AfterShipTracking | null> {
  const slug = CARRIER_SLUG[carrier] ?? carrier;

  const params = new URLSearchParams({ tracking_numbers: trackingNumber, slug });
  const res = await fetch(`${BASE}/trackings?${params}`, {
    headers: headers(),
  });

  const json = await res.json() as {
    meta: { code: number; message: string };
    data?: { trackings: AfterShipTracking[] };
  };

  if (json.meta.code !== 200) {
    throw new Error(`AfterShip fetch failed (${json.meta.code}): ${json.meta.message}`);
  }

  return json.data?.trackings?.[0] ?? null;
}

/**
 * Map an AfterShip tag to our internal booking status string.
 */
export function tagToStatus(tag: string): string {
  return TAG_TO_STATUS[tag] ?? "in_transit";
}
