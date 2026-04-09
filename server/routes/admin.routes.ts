import { Hono } from "hono";
import { cors } from "hono/cors";
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

export default adminRoutes;
