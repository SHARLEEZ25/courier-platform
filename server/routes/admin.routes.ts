import { Hono } from "hono";
import { sql } from "../config/db.js";

const adminRoutes = new Hono();



/**
 * POST /api/admin/base-rate
 *
 * Raw rate card lookup — returns the base rate from DB before any surcharges.
 * Used by the standalone admin price calculator tool.
 *
 * Body: { weight_kg: number, country: string, carrier: "dhl"|"fedex"|"ups", shipment_type: "document"|"package" }
 * Response: { base_rate_inr, chargeable_kg, zone, carrier, country }
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

  // Chargeable weight — round up to nearest 0.5 kg
  const chargeable = Math.ceil(weight_kg * 2) / 2;

  // FedEx uses service_type = 'IP'; DHL/UPS use 'standard'
  const serviceType = carrierSlug === "fedex" ? "IP" : "standard";

  // ── Step 1: Zone lookup ──────────────────────────────────────────────────
  const zoneRows = await sql<{ zone_code: string }[]>`
    SELECT zone_code
    FROM carrier_zones
    WHERE carrier_id = ${carrierSlug}
      AND origin_country = 'India'
      AND destination_country = ${country.trim()}
      AND service_type = ${serviceType}
      AND (effective_to IS NULL OR effective_to >= ${today}::date)
    ORDER BY effective_from DESC
    LIMIT 1
  `;

  if (zoneRows.length === 0) {
    return c.json({
      ok: false,
      error: `No zone found for ${carrierSlug.toUpperCase()} → ${country}. Country may not be served.`,
    }, 404);
  }

  const zone = zoneRows[0].zone_code;

  // Effective shipment type — carriers fall back to package table for heavy documents
  const effectiveType: "document" | "package" =
    (carrierSlug === "dhl"   && shipType === "document" && chargeable > 2.0) ||
    (carrierSlug === "ups"   && shipType === "document" && chargeable > 5.0) ||
    (carrierSlug === "fedex" && shipType === "document" && chargeable > 2.5)
      ? "package"
      : shipType;

  // ── Step 2: Rate card step lookup ────────────────────────────────────────
  const stepRows = await sql<{ price_inr: string }[]>`
    SELECT price_inr
    FROM rate_card_steps
    WHERE carrier_id    = ${carrierSlug}
      AND zone_code     = ${zone}
      AND shipment_type = ${effectiveType}
      AND weight_kg     = ${chargeable}
      AND (effective_to IS NULL OR effective_to >= ${today}::date)
    LIMIT 1
  `;

  if (stepRows.length > 0) {
    return c.json({
      ok: true,
      base_rate_inr:  Math.round(Number(stepRows[0].price_inr) * 100) / 100,
      chargeable_kg:  chargeable,
      zone,
      carrier:        carrierSlug,
      country:        country.trim(),
      shipment_type:  effectiveType,
    });
  }

  // ── Step 3: Fallback — rate card band lookup ─────────────────────────────
  const bandRows = await sql<{
    price_per_kg: string;
    base_price_inr: string;
    band_type: string;
    weight_min_kg: string;
  }[]>`
    SELECT price_per_kg, base_price_inr, band_type, weight_min_kg
    FROM rate_card_bands
    WHERE carrier_id    = ${carrierSlug}
      AND zone_code     = ${zone}
      AND shipment_type = ${effectiveType}
      AND weight_min_kg <= ${chargeable}
      AND (weight_max_kg IS NULL OR weight_max_kg >= ${chargeable})
      AND (effective_to IS NULL OR effective_to >= ${today}::date)
    ORDER BY weight_min_kg DESC
    LIMIT 1
  `;

  if (bandRows.length === 0) {
    return c.json({
      ok: false,
      error: `No rate found for ${carrierSlug.toUpperCase()} zone ${zone} at ${chargeable} kg (${effectiveType}).`,
    }, 404);
  }

  const band    = bandRows[0];
  const perKg   = Number(band.price_per_kg);
  const base    = Number(band.base_price_inr);
  const wMin    = Number(band.weight_min_kg);

  const rawBand = band.band_type === "additive"
    ? base + (chargeable - wMin) * perKg
    : chargeable * perKg;

  const priceInr = band.band_type === "multiplicative"
    ? Math.max(rawBand, base)
    : rawBand;

  return c.json({
    ok: true,
    base_rate_inr:  Math.round(priceInr * 100) / 100,
    chargeable_kg:  chargeable,
    zone,
    carrier:        carrierSlug,
    country:        country.trim(),
    shipment_type:  effectiveType,
  });
});

/**
 * GET /api/admin/config/:carrier
 *
 * Returns the live surcharge config for a carrier — used by the admin calculator
 * to auto-populate fields from DB instead of manual entry.
 *
 * Response includes:
 *   - fsc_pct          : from fuel_surcharges (monthly)
 *   - margin_pct       : from surcharge_config
 *   - demand_active    : from surcharge_config
 *   - demand_per_kg    : from surcharge_config
 *   - peak_active/amount  : FedEx only, from surcharge_config
 *   - surge_active/amount : UPS only, from surcharge_config
 *   - PDF hardcoded amounts per carrier (for display in the calculator)
 */
adminRoutes.get("/config/:carrier", async (c) => {
  const carrier = c.req.param("carrier");
  if (!["dhl", "fedex", "ups"].includes(carrier)) {
    return c.json({ ok: false, error: "carrier must be dhl, fedex, or ups" }, 400);
  }

  const today = new Date().toISOString().split("T")[0];

  // ── FSC from fuel_surcharges ────────────────────────────────────────────
  const fscRows = await sql<{ fsc_percent: string }[]>`
    SELECT fsc_percent FROM fuel_surcharges
    WHERE carrier_id = ${carrier}
      AND effective_from <= ${today}::date
    ORDER BY effective_from DESC
    LIMIT 1
  `;
  const fsc_pct = fscRows.length > 0 ? Number(fscRows[0].fsc_percent) : 0;

  // ── surcharge_config keys ───────────────────────────────────────────────
  const configRows = await sql<{ key: string; value_num: string | null; value_bool: boolean | null }[]>`
    SELECT key, value_num, value_bool FROM surcharge_config
    WHERE carrier_id = ${carrier}
  `;
  const cfg: Record<string, number | boolean> = {};
  for (const row of configRows) {
    cfg[row.key] = row.value_bool !== null ? row.value_bool : Number(row.value_num ?? 0);
  }

  // ── PDF-hardcoded amounts (per carrier) ────────────────────────────────
  const pdf: Record<string, number> = {
    gst_pct: 18,
  };

  if (carrier === "dhl") {
    pdf.premium_1200_inr = 1000;
    pdf.premium_900_inr  = 3000;
  }

  if (carrier === "ups") {
    pdf.us_inbound_inr       = 230;
    pdf.remote_per_kg_inr    = 57;
    pdf.remote_min_inr       = 3150;
    pdf.formal_clearance_inr = 3150;
    pdf.ddp_inr              = 1050;
    pdf.signature_inr        = 368;
    pdf.girth_surcharge_inr  = 9450;
  }

  return c.json({
    ok: true,
    carrier,
    fsc_pct,
    margin_pct:    cfg.margin_pct    ?? 0,
    demand_active: cfg.demand_active ?? false,
    demand_per_kg: cfg.demand_per_kg ?? 0,
    // FedEx only
    ...(carrier === "fedex" && {
      peak_active: cfg.peak_active ?? false,
      peak_amount: cfg.peak_amount ?? 0,
    }),
    // UPS only
    ...(carrier === "ups" && {
      surge_active: cfg.surge_active ?? false,
      surge_amount: cfg.surge_amount ?? 0,
    }),
    // PDF hardcoded amounts
    ...pdf,
  });
});

export default adminRoutes;
