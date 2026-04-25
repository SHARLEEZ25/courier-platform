import { Hono } from "hono";
import { sql } from "../config/db.js";
import { requireAdminAuth } from "../middleware/auth.middleware.js";
import { ok, err } from "../types/api.types.js";
import {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
} from "../db/queries/bookings.queries.js";
import {
  getTrackingEventsByBookingId,
  addTrackingEvent,
} from "../db/queries/tracking.queries.js";
import type { BookingStatus } from "../types/db.types.js";

const adminRoutes = new Hono();

// All admin routes require admin auth
adminRoutes.use("/*", requireAdminAuth);

// ── Identity check ────────────────────────────────────────────────────────────

/**
 * GET /api/admin/me
 * Returns the admin's uid and email. Frontend calls this to verify admin access.
 */
adminRoutes.get("/me", (c) => {
  const user = c.get("user");
  return c.json(ok({ uid: user.id, email: user.email, name: user.name }));
});

// ── Bookings ──────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/bookings
 * List all bookings with optional filters.
 * Query params: status, carrier, q (search ref/tracking), from, to, limit, offset
 */
adminRoutes.get("/bookings", async (c) => {
  const { status, carrier, q, from, to, limit, offset } = c.req.query();

  const result = await getAllBookings({
    status:     status || undefined,
    carrier_id: carrier || undefined,
    q:          q || undefined,
    from:       from || undefined,
    to:         to || undefined,
    limit:      limit  ? Number(limit)  : 50,
    offset:     offset ? Number(offset) : 0,
  });

  return c.json(ok(result));
});

/**
 * GET /api/admin/bookings/:id
 * Booking detail + all tracking events for that booking.
 */
adminRoutes.get("/bookings/:id", async (c) => {
  const id = c.req.param("id");
  const [booking, events] = await Promise.all([
    getBookingById(id),
    getTrackingEventsByBookingId(id),
  ]);

  if (!booking) return c.json(err("Booking not found"), 404);

  return c.json(ok({ ...booking, tracking_events: events }));
});

/**
 * PATCH /api/admin/bookings/:id/status
 * Update booking status. Only allows forward progression (or cancellation).
 * Body: { status: BookingStatus }
 */
adminRoutes.patch("/bookings/:id/status", async (c) => {
  const id = c.req.param("id");

  let body: { status?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json(err("Invalid JSON body"), 400);
  }

  const validStatuses: BookingStatus[] = [
    "pending", "confirmed", "picked_up", "in_transit", "delivered", "cancelled",
  ];

  if (typeof body.status !== "string" || !validStatuses.includes(body.status as BookingStatus)) {
    return c.json(err(`status must be one of: ${validStatuses.join(", ")}`), 400);
  }

  const updated = await updateBookingStatus(id, body.status);
  if (!updated) return c.json(err("Booking not found"), 404);

  return c.json(ok(updated));
});

/**
 * POST /api/admin/bookings/:id/tracking-event
 * Manually add a tracking event to a booking.
 * Body: { event_code, description, location?, event_at }
 */
adminRoutes.post("/bookings/:id/tracking-event", async (c) => {
  const id = c.req.param("id");

  let body: { event_code?: unknown; description?: unknown; location?: unknown; event_at?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json(err("Invalid JSON body"), 400);
  }

  if (typeof body.event_code !== "string" || !body.event_code.trim()) {
    return c.json(err("event_code is required"), 400);
  }
  if (typeof body.description !== "string" || !body.description.trim()) {
    return c.json(err("description is required"), 400);
  }
  if (typeof body.event_at !== "string" || !body.event_at.trim()) {
    return c.json(err("event_at is required (ISO datetime)"), 400);
  }

  const booking = await getBookingById(id);
  if (!booking) return c.json(err("Booking not found"), 404);

  const event = await addTrackingEvent({
    booking_id:      booking.id,
    tracking_number: booking.tracking_number ?? booking.booking_ref,
    event_code:      body.event_code.trim(),
    description:     body.description.trim(),
    location:        typeof body.location === "string" ? body.location.trim() || null : null,
    event_at:        body.event_at.trim(),
  });

  if (!event) {
    return c.json(err("Duplicate event — same code, tracking number, and timestamp already exists"), 409);
  }

  return c.json(ok(event), 201);
});

// ── Surcharge Config ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/surcharge-config
 * Returns all surcharge_config rows grouped by carrier.
 */
adminRoutes.get("/surcharge-config", async (c) => {
  const rows = await sql<{
    carrier_id: string;
    key: string;
    value_num: string | null;
    value_bool: boolean | null;
    updated_at: string;
  }[]>`
    SELECT carrier_id, key, value_num, value_bool, updated_at
    FROM surcharge_config
    ORDER BY carrier_id, key
  `;

  // Group by carrier
  const grouped: Record<string, Record<string, number | boolean | null>> = {};
  for (const row of rows) {
    if (!grouped[row.carrier_id]) grouped[row.carrier_id] = {};
    grouped[row.carrier_id][row.key] =
      row.value_bool !== null ? row.value_bool : (row.value_num !== null ? Number(row.value_num) : null);
  }

  return c.json(ok(grouped));
});

/**
 * PATCH /api/admin/surcharge-config/:carrier/:key
 * Update a single surcharge config value.
 * Body: { value_num: number } OR { value_bool: boolean }
 */
adminRoutes.patch("/surcharge-config/:carrier/:key", async (c) => {
  const carrier = c.req.param("carrier");
  const key     = c.req.param("key");

  if (!["dhl", "fedex", "ups"].includes(carrier)) {
    return c.json(err("carrier must be dhl, fedex, or ups"), 400);
  }

  let body: { value_num?: unknown; value_bool?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json(err("Invalid JSON body"), 400);
  }

  const hasNum  = body.value_num  !== undefined;
  const hasBool = body.value_bool !== undefined;

  if (!hasNum && !hasBool) {
    return c.json(err("Provide either value_num or value_bool"), 400);
  }
  if (hasNum && typeof body.value_num !== "number") {
    return c.json(err("value_num must be a number"), 400);
  }
  if (hasBool && typeof body.value_bool !== "boolean") {
    return c.json(err("value_bool must be a boolean"), 400);
  }

  const updated = await sql<{ carrier_id: string; key: string; value_num: string | null; value_bool: boolean | null; updated_at: string }[]>`
    UPDATE surcharge_config
    SET
      value_num  = ${hasNum  ? (body.value_num  as number)  : null},
      value_bool = ${hasBool ? (body.value_bool as boolean) : null},
      updated_at = NOW()
    WHERE carrier_id = ${carrier} AND key = ${key}
    RETURNING carrier_id, key, value_num, value_bool, updated_at
  `;

  if (updated.length === 0) {
    return c.json(err(`No config found for carrier=${carrier} key=${key}`), 404);
  }

  return c.json(ok(updated[0]));
});

// ── Fuel Surcharges ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/fuel-surcharges
 * Returns all fuel surcharge rows, newest first.
 */
adminRoutes.get("/fuel-surcharges", async (c) => {
  const rows = await sql<{
    id: string;
    carrier_id: string;
    fsc_percent: string;
    effective_from: string;
    effective_to: string | null;
    created_at: string;
  }[]>`
    SELECT id, carrier_id, fsc_percent, effective_from, effective_to, created_at
    FROM fuel_surcharges
    ORDER BY effective_from DESC, carrier_id
  `;

  return c.json(ok(rows.map((r) => ({
    ...r,
    fsc_percent: Number(r.fsc_percent),
  }))));
});

/**
 * POST /api/admin/fuel-surcharges
 * Insert a new FSC row. Creates a new entry; does not overwrite existing ones.
 * Body: { carrier_id, fsc_percent, effective_from, effective_to? }
 */
adminRoutes.post("/fuel-surcharges", async (c) => {
  let body: { carrier_id?: unknown; fsc_percent?: unknown; effective_from?: unknown; effective_to?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json(err("Invalid JSON body"), 400);
  }

  if (!["dhl", "fedex", "ups", "aramex"].includes(body.carrier_id as string)) {
    return c.json(err("carrier_id must be dhl, fedex, ups, or aramex"), 400);
  }
  if (typeof body.fsc_percent !== "number" || body.fsc_percent < 0 || body.fsc_percent > 100) {
    return c.json(err("fsc_percent must be a number between 0 and 100"), 400);
  }
  if (typeof body.effective_from !== "string" || !body.effective_from.trim()) {
    return c.json(err("effective_from is required (YYYY-MM-DD)"), 400);
  }

  const effectiveTo =
    typeof body.effective_to === "string" && body.effective_to.trim()
      ? body.effective_to.trim()
      : null;

  try {
    const rows = await sql<{ id: string; carrier_id: string; fsc_percent: string; effective_from: string; effective_to: string | null; created_at: string }[]>`
      INSERT INTO fuel_surcharges (carrier_id, fsc_percent, effective_from, effective_to)
      VALUES (
        ${body.carrier_id as string},
        ${body.fsc_percent as number},
        ${body.effective_from.trim()}::date,
        ${effectiveTo ? sql`${effectiveTo}::date` : sql`NULL`}
      )
      RETURNING id, carrier_id, fsc_percent, effective_from, effective_to, created_at
    `;

    return c.json(ok({ ...rows[0], fsc_percent: Number(rows[0].fsc_percent) }), 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return c.json(err("A fuel surcharge for this carrier and effective_from date already exists"), 409);
    }
    console.error("[admin] insert fuel_surcharge error:", e);
    return c.json(err("Failed to insert fuel surcharge"), 500);
  }
});

// ── Legacy rate-calc tools (kept, now auth-protected) ─────────────────────────

/**
 * POST /api/admin/base-rate
 * Raw rate card lookup — returns base rate before surcharges.
 * Body: { weight_kg, country, carrier, shipment_type }
 */
adminRoutes.post("/base-rate", async (c) => {
  let body: { weight_kg?: unknown; country?: unknown; carrier?: unknown; shipment_type?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const { weight_kg, country, carrier, shipment_type } = body;

  if (typeof weight_kg !== "number" || weight_kg <= 0) {
    return c.json({ ok: false, error: "weight_kg must be a positive number" }, 400);
  }
  if (typeof country !== "string" || !country.trim()) {
    return c.json({ ok: false, error: "country is required" }, 400);
  }
  if (!["dhl", "fedex", "ups"].includes(carrier as string)) {
    return c.json({ ok: false, error: "carrier must be dhl, fedex, or ups" }, 400);
  }
  if (!["document", "package"].includes(shipment_type as string)) {
    return c.json({ ok: false, error: "shipment_type must be document or package" }, 400);
  }

  const carrierSlug = carrier as "dhl" | "fedex" | "ups";
  const shipType    = shipment_type as "document" | "package";
  const today       = new Date().toISOString().split("T")[0];
  const chargeable  = Math.ceil(weight_kg * 2) / 2;
  const serviceType = carrierSlug === "fedex" ? "IP" : "standard";

  const zoneRows = await sql<{ zone_code: string }[]>`
    SELECT zone_code FROM carrier_zones
    WHERE carrier_id = ${carrierSlug}
      AND origin_country = 'India'
      AND destination_country = ${country.trim()}
      AND service_type = ${serviceType}
      AND (effective_to IS NULL OR effective_to >= ${today}::date)
    ORDER BY effective_from DESC LIMIT 1
  `;

  if (zoneRows.length === 0) {
    return c.json({ ok: false, error: `No zone found for ${carrierSlug.toUpperCase()} → ${country}.` }, 404);
  }

  const zone = zoneRows[0].zone_code;
  const effectiveType: "document" | "package" =
    (carrierSlug === "dhl"   && shipType === "document" && chargeable > 2.0) ||
    (carrierSlug === "ups"   && shipType === "document" && chargeable > 5.0) ||
    (carrierSlug === "fedex" && shipType === "document" && chargeable > 2.5)
      ? "package" : shipType;

  const stepRows = await sql<{ price_inr: string }[]>`
    SELECT price_inr FROM rate_card_steps
    WHERE carrier_id = ${carrierSlug} AND zone_code = ${zone}
      AND shipment_type = ${effectiveType} AND weight_kg = ${chargeable}
      AND (effective_to IS NULL OR effective_to >= ${today}::date)
    LIMIT 1
  `;

  if (stepRows.length > 0) {
    return c.json({ ok: true, base_rate_inr: Math.round(Number(stepRows[0].price_inr) * 100) / 100, chargeable_kg: chargeable, zone, carrier: carrierSlug, country: country.trim(), shipment_type: effectiveType });
  }

  const bandRows = await sql<{ price_per_kg: string; base_price_inr: string; band_type: string; weight_min_kg: string }[]>`
    SELECT price_per_kg, base_price_inr, band_type, weight_min_kg FROM rate_card_bands
    WHERE carrier_id = ${carrierSlug} AND zone_code = ${zone}
      AND shipment_type = ${effectiveType}
      AND weight_min_kg <= ${chargeable}
      AND (weight_max_kg IS NULL OR weight_max_kg >= ${chargeable})
      AND (effective_to IS NULL OR effective_to >= ${today}::date)
    ORDER BY weight_min_kg DESC LIMIT 1
  `;

  if (bandRows.length === 0) {
    return c.json({ ok: false, error: `No rate found for ${carrierSlug.toUpperCase()} zone ${zone} at ${chargeable} kg.` }, 404);
  }

  const band = bandRows[0];
  const perKg  = Number(band.price_per_kg);
  const base   = Number(band.base_price_inr);
  const wMin   = Number(band.weight_min_kg);
  const rawBand = band.band_type === "additive" ? base + (chargeable - wMin) * perKg : chargeable * perKg;
  const priceInr = band.band_type === "multiplicative" ? Math.max(rawBand, base) : rawBand;

  return c.json({ ok: true, base_rate_inr: Math.round(priceInr * 100) / 100, chargeable_kg: chargeable, zone, carrier: carrierSlug, country: country.trim(), shipment_type: effectiveType });
});

/**
 * GET /api/admin/config/:carrier
 * Returns live surcharge config for the admin calculator.
 */
adminRoutes.get("/config/:carrier", async (c) => {
  const carrier = c.req.param("carrier");
  if (!["dhl", "fedex", "ups"].includes(carrier)) {
    return c.json({ ok: false, error: "carrier must be dhl, fedex, or ups" }, 400);
  }

  const today = new Date().toISOString().split("T")[0];

  const fscRows = await sql<{ fsc_percent: string }[]>`
    SELECT fsc_percent FROM fuel_surcharges
    WHERE carrier_id = ${carrier}
      AND effective_from <= ${today}::date
      AND (effective_to IS NULL OR effective_to >= ${today}::date)
    ORDER BY effective_from DESC LIMIT 1
  `;
  const fsc_pct = fscRows.length > 0 ? Number(fscRows[0].fsc_percent) : 0;

  const configRows = await sql<{ key: string; value_num: string | null; value_bool: boolean | null }[]>`
    SELECT key, value_num, value_bool FROM surcharge_config WHERE carrier_id = ${carrier}
  `;
  const cfg: Record<string, number | boolean> = {};
  for (const row of configRows) {
    cfg[row.key] = row.value_bool !== null ? row.value_bool : Number(row.value_num ?? 0);
  }

  const pdf: Record<string, number> = { gst_pct: 18 };
  if (carrier === "dhl") { pdf.premium_1200_inr = 1000; pdf.premium_900_inr = 3000; }
  if (carrier === "ups") {
    pdf.us_inbound_inr = 230; pdf.remote_per_kg_inr = 57; pdf.remote_min_inr = 3150;
    pdf.formal_clearance_inr = 3150; pdf.ddp_inr = 1050; pdf.signature_inr = 368; pdf.girth_surcharge_inr = 9450;
  }

  return c.json({ ok: true, carrier, fsc_pct, margin_pct: cfg.margin_pct ?? 0, demand_active: cfg.demand_active ?? false, demand_per_kg: cfg.demand_per_kg ?? 0, ...(carrier === "fedex" && { peak_active: cfg.peak_active ?? false, peak_amount: cfg.peak_amount ?? 0 }), ...(carrier === "ups" && { surge_active: cfg.surge_active ?? false, surge_amount: cfg.surge_amount ?? 0 }), ...pdf });
});

/**
 * GET /api/admin/item-types
 * Returns all item types and their discount percentages.
 */
adminRoutes.get("/item-types", async (c) => {
  const types = await sql`
    SELECT item_type_id, display_name, discount_pct FROM item_type_discounts
    ORDER BY display_name ASC
  `;
  return c.json({ ok: true, types });
});

export default adminRoutes;
