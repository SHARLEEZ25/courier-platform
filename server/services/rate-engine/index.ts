import { sql } from "../../config/db.js";
import type {
  RateEngineInput,
  RateResult,
  CarrierSlug,
} from "../../types/rate-engine.types.js";
import { CARRIERS } from "../../../shared/schemas/rate-request.schema.js";
import { chargeableWeight } from "./weight-calc.js";
import { applyFsc } from "./fsc.js";
import { applyGst } from "./gst.js";
import { DELIVERY_DAYS } from "./zone-resolver.js";

// ── Module-level cache (persists across warm invocations) ─────────────────────
interface CacheEntry<T> { value: T; expiresAt: number }
const _cache = new Map<string, CacheEntry<unknown>>();

function cacheGet<T>(key: string): T | null {
  const entry = _cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.value as T;
}
function cacheSet<T>(key: string, value: T, ttlMs: number): T {
  _cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}
async function withCache<T>(key: string, ttlMs: number, fetch: () => Promise<T>): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== null) return cached;
  return fetch().then(v => cacheSet(key, v, ttlMs));
}

const TTL_1H   = 60 * 60 * 1000;
const TTL_30M  = 30 * 60 * 1000;
const TTL_5MIN =  5 * 60 * 1000; // surcharge toggles — admin may flip in real-time

type ZoneCacheRow      = { carrier_id: string; zone_code: string };
type FscCacheRow       = { carrier_id: string; fsc_percent: string };
type SurchargeRow      = { carrier_id: string; key: string; value_num: string | null; value_bool: boolean | null };
type StepCacheRow      = { carrier_id: string; zone_code: string; shipment_type: string; price_inr: number };
type BandCacheRow      = { carrier_id: string; zone_code: string; shipment_type: string; price_per_kg: number; base_price_inr: number; band_type: string; weight_min_kg: number };

const CARRIER_NAMES: Record<CarrierSlug, string> = {
  dhl: "DHL Express",
  fedex: "FedEx International",
  ups: "UPS Worldwide",
  aramex: "Aramex Express",
};

const PACKAGING_FEES: Record<"none" | "standard" | "premium", number> = {
  none: 0,
  standard: 150,
  premium: 350,
};

const FALLBACK_FSC: Record<CarrierSlug, number> = {
  dhl: 29.5,
  fedex: 27.0,
  ups: 26.5,
  aramex: 24.0,
};

const INSURANCE_FEE = 199;

// DHL premium service flat adds (hardcoded per PDF)
const DHL_PREMIUM_FEES: Record<string, number> = {
  standard:      0,
  premium_900:   3000,
  premium_1200:  1000,
};

// UPS fixed surcharges (hardcoded per PDF)
const UPS_FORMAL_CLEARANCE = 3150;
const UPS_DDP              = 1050;
const UPS_SIGNATURE        = 368;
const UPS_US_INBOUND       = 230;
const UPS_REMOTE_PER_KG    = 57;
const UPS_REMOTE_MIN       = 3150;
const UPS_OVERSIZE_FEE     = 9450; // girth >400cm per PDF (oversize/overweight fee)

/**
 * Parses a surcharge_config result set into a per-carrier key/value map.
 * Returns: { dhl: { margin_pct: 20, demand_active: false, ... }, ... }
 */
function parseSurchargeConfig(
  rows: SurchargeRow[]
): Record<string, Record<string, number | boolean>> {
  const out: Record<string, Record<string, number | boolean>> = {};
  for (const row of rows) {
    if (!out[row.carrier_id]) out[row.carrier_id] = {};
    if (row.value_bool !== null) {
      out[row.carrier_id][row.key] = row.value_bool;
    } else if (row.value_num !== null) {
      out[row.carrier_id][row.key] = Number(row.value_num);
    }
  }
  return out;
}

/**
 * Core rate calculation pipeline.
 *
 * Computation order per PDF spec:
 *   base → margin → FSC → demand surcharge
 *   → carrier-specific extras → GST
 *
 * All DB queries fire in ONE parallel batch.
 */
export async function calculateRates(
  input: RateEngineInput
): Promise<RateResult[]> {
  // DHL hard limits from PDF
  if (input.carrier === 'dhl' || !input.carrier) {
    if (input.weightKg > 3000) {
      if (input.carrier === 'dhl') return [];
      // else: DHL simply won't appear in all-carrier results
    }
    if (input.weightKg > 1000) {
      if (input.carrier === 'dhl') return [];
      // else: DHL simply won't appear in all-carrier results
    }
    if (input.dims && input.dims.l > 300) {
      if (input.carrier === 'dhl') return [];
    }
  }

  // UPS hard limit from PDF
  if (input.carrier === 'ups' || !input.carrier) {
    if (input.weightKg > 70) {
      if (input.carrier === 'ups') return [];
    }
  }

  const allCarriers = [...CARRIERS];
  const today = new Date().toISOString().split("T")[0];
  const { chargeable, volumetric } = chargeableWeight(input.weightKg, input.dims);

  // Girth = L + 2W + 2H (UPS PDF rule: >300cm → 40 kg min; >400cm → oversize fee)
  const girth = input.dims ? (input.dims.l + 2 * input.dims.w + 2 * input.dims.h) : 0;

  // FedEx zone lookup needs service_type column
  const fedexService = input.fedexService ?? 'IP';

  const zoneKey      = `zones:${input.origin}:${input.destination}:${fedexService}`;
  const surchargeKey = `surcharge_cfg:all`;
  const fscKey       = `fsc:all`;
  const stepKey      = `steps:${chargeable}`;
  const bandKey      = `bands:${chargeable}`;

  // ── Single wave: all 6 queries in parallel ────────────────────────────────
  const start = Date.now();
  const [zoneRows, surchargeRow, surchargeConfigRows, fscRows, stepRows, bandRows] = await Promise.all([

    withCache<ZoneCacheRow[]>(zoneKey, TTL_30M, () =>
      sql<ZoneCacheRow[]>`
        SELECT carrier_id, zone_code
        FROM carrier_zones
        WHERE carrier_id = ANY(${allCarriers}::text[])
          AND origin_country = ${input.origin}
          AND destination_country = ${input.destination}
          AND (
            service_type = 'standard'
            OR (carrier_id = 'fedex' AND service_type = ${fedexService})
          )
          AND (effective_to IS NULL OR effective_to >= ${today}::date)
        ORDER BY effective_from DESC
      `
    ),

    input.pickupPincode
      ? sql<{ surcharge_inr: number }[]>`
          SELECT surcharge_inr
          FROM pickup_zones
          WHERE pincode = ${input.pickupPincode}
          LIMIT 1
        `.then(rows => rows[0] ?? null)
      : Promise.resolve(null),

    withCache<SurchargeRow[]>(surchargeKey, TTL_5MIN, () =>
      sql<SurchargeRow[]>`
        SELECT carrier_id, key, value_num, value_bool
        FROM surcharge_config
        WHERE carrier_id = ANY(${allCarriers}::text[])
      `
    ),

    withCache<FscCacheRow[]>(fscKey, TTL_1H, () =>
      sql<FscCacheRow[]>`
        SELECT carrier_id, fsc_percent
        FROM fuel_surcharges
        WHERE carrier_id = ANY(${allCarriers}::text[])
          AND effective_from <= ${today}::date
          AND (effective_to IS NULL OR effective_to >= ${today}::date)
        ORDER BY effective_from DESC
      `
    ),

    withCache<StepCacheRow[]>(stepKey, TTL_30M, () =>
      sql<StepCacheRow[]>`
        SELECT carrier_id, zone_code, shipment_type, price_inr
        FROM rate_card_steps
        WHERE carrier_id = ANY(${allCarriers}::text[])
          AND weight_kg = ${chargeable}
          AND (effective_to IS NULL OR effective_to >= ${today}::date)
      `
    ),

    withCache<BandCacheRow[]>(bandKey, TTL_30M, () =>
      sql<BandCacheRow[]>`
        SELECT carrier_id, zone_code, shipment_type, price_per_kg, base_price_inr, band_type, weight_min_kg
        FROM rate_card_bands
        WHERE carrier_id = ANY(${allCarriers}::text[])
          AND weight_min_kg <= ${chargeable}
          AND (weight_max_kg IS NULL OR weight_max_kg >= ${chargeable})
          AND (effective_to IS NULL OR effective_to >= ${today}::date)
        ORDER BY weight_min_kg DESC
      `
    ),
  ]);

  const duration = Date.now() - start;
  if (duration > 1500) {
    console.warn(`[rate-engine] DB queries took ${duration}ms (slow batch)`);
  }

  // ── Build lookup maps ─────────────────────────────────────────────────────
  const zoneMap = new Map<CarrierSlug, string>();
  for (const row of zoneRows) {
    if (!zoneMap.has(row.carrier_id as CarrierSlug)) {
      zoneMap.set(row.carrier_id as CarrierSlug, row.zone_code);
    }
  }

  const cfgMap = parseSurchargeConfig(surchargeConfigRows);

  // Build FSC map — first row per carrier is the most-recent active row (ORDER BY effective_from DESC)
  const fscMap = new Map<string, number>();
  for (const row of fscRows) {
    if (!fscMap.has(row.carrier_id)) fscMap.set(row.carrier_id, Number(row.fsc_percent));
  }

  const pickupSurcharge = surchargeRow ? Number(surchargeRow.surcharge_inr) : 0;

  const requestedCarriers = input.carrier ? [input.carrier] : allCarriers;
  // Filter out UPS if weight exceeds limit
  const activeCarriers = requestedCarriers.filter(c => {
    if (!zoneMap.has(c)) return false;
    if (c === 'ups' && input.weightKg > 70) return false;
    if (c === 'dhl' && input.weightKg > 3000) return false;
    if (c === 'dhl' && input.dims && input.dims.l > 300) return false;
    return true;
  });
  if (activeCarriers.length === 0) return [];

  const pairKey = (c: string, z: string, t: string) => `${c}:${z}:${t}`;
  const stepLookup = new Map<string, number>();
  for (const row of stepRows) {
    const k = pairKey(row.carrier_id, row.zone_code, row.shipment_type);
    if (!stepLookup.has(k)) stepLookup.set(k, Number(row.price_inr));
  }

  const bandLookup = new Map<string, BandCacheRow>();
  for (const row of bandRows) {
    const k = pairKey(row.carrier_id, row.zone_code, row.shipment_type);
    if (!bandLookup.has(k)) bandLookup.set(k, row);
  }

  // ── Pure math — no DB calls ───────────────────────────────────────────────
  const results: RateResult[] = [];

  for (const carrier of activeCarriers) {
    const zone = zoneMap.get(carrier)!;
    const cfg = cfgMap[carrier] ?? {};

    // DHL: declared 'document' above 2.0 kg falls to the package table (Table B).
    // UPS: document rate table only covers 0.5–5.0 kg (per UPS-2026.pdf pages 1 & 3).
    //      Above 5.0 kg, use package rates.
    // FedEx: Pak (document) table only covers 0.5–2.5 kg (per FDX EXPORT-2026.pdf).
    //        Above 2.5 kg, use package rates.
    const effectiveType: 'document' | 'package' =
      (carrier === 'dhl'   && input.shipmentType === 'document' && chargeable > 2.0) ||
      (carrier === 'ups'   && input.shipmentType === 'document' && chargeable > 5.0) ||
      (carrier === 'fedex' && input.shipmentType === 'document' && chargeable > 2.5)
        ? 'package'
        : input.shipmentType;

    const k = pairKey(carrier, zone, effectiveType);

    let priceInr: number | null = null;
    if (stepLookup.has(k)) {
      priceInr = stepLookup.get(k)!;
    } else if (bandLookup.has(k)) {
      const band = bandLookup.get(k)!;
      const perKg = Number(band.price_per_kg);
      const base  = Number(band.base_price_inr);
      const wMin  = Number(band.weight_min_kg);
      const rawBand =
        band.band_type === "additive"
          ? base + (chargeable - wMin) * perKg
          : chargeable * perKg;
      // Clamp: multiplicative bands can dip below the last step price at the
      // crossover point (e.g. DHL 30.1–33.9 kg). base_price_inr holds the
      // 30 kg (DHL) / 20 kg (UPS) step price as the minimum floor.
      priceInr = band.band_type === "multiplicative"
        ? Math.max(rawBand, base)
        : rawBand;
    }

    if (priceInr === null) continue;

    // Effective chargeable weight for this carrier (may be overridden by UPS girth rule)
    let effectiveChargeable = chargeable;

    // UPS girth rule (PDF): if L+2W+2H > 300cm, minimum 40kg chargeable weight.
    // UPS rate_card_steps only cover up to 20kg; 40kg always falls in a band.
    if (carrier === 'ups' && girth > 300 && chargeable < 40) {
      effectiveChargeable = 40;
      const girthBandRows = await sql<{ price_per_kg: number; base_price_inr: number; band_type: string; weight_min_kg: number }[]>`
        SELECT price_per_kg, base_price_inr, band_type, weight_min_kg
        FROM rate_card_bands
        WHERE carrier_id    = 'ups'
          AND zone_code     = ${zone}
          AND shipment_type = ${effectiveType}
          AND weight_min_kg <= 40
          AND (weight_max_kg IS NULL OR weight_max_kg >= 40)
          AND (effective_to IS NULL OR effective_to >= ${today}::date)
        ORDER BY weight_min_kg DESC
        LIMIT 1
      `;
      const gb = girthBandRows[0];
      if (gb) {
        const perKg = Number(gb.price_per_kg);
        const base  = Number(gb.base_price_inr);
        const wMin  = Number(gb.weight_min_kg);
        const rawBand = gb.band_type === 'additive'
          ? base + (40 - wMin) * perKg
          : 40 * perKg;
        priceInr = gb.band_type === 'multiplicative' ? Math.max(rawBand, base) : rawBand;
      }
    }

    // Step 1: margin (Uniex markup on carrier base — internal, never shown to customer)
    const marginPct = Number(cfg['margin_pct'] ?? 20);
    const marginInr = priceInr * (marginPct / 100);
    const withMargin = priceInr + marginInr;

    // Step 2: FSC (applied on withMargin per spec)
    const fscPct = fscMap.get(carrier) ?? FALLBACK_FSC[carrier as CarrierSlug] ?? 27.0;
    const fscInr = applyFsc(withMargin, fscPct);

    // Step 3: demand surcharge
    const demandActive  = cfg['demand_active'] === true;
    const demandPerKg   = Number(cfg['demand_per_kg'] ?? 0);
    const demandSurchargeInr = demandActive ? (demandPerKg * effectiveChargeable) : 0;

    // Step 4: carrier-specific extras
    let premiumServiceInr = 0;
    let peakSurchargeInr  = 0;
    let usInboundInr      = 0;
    let upsFixedInr       = 0;

    if (carrier === 'dhl') {
      const svc = input.dhlService ?? 'standard';
      premiumServiceInr = DHL_PREMIUM_FEES[svc] ?? 0;
    }

    if (carrier === 'fedex') {
      const peakActive = cfg['peak_active'] === true;
      if (peakActive) {
        peakSurchargeInr = Number(cfg['peak_amount'] ?? 0);
      }
    }

    if (carrier === 'ups') {
      // UPS surge fee (separate from FSC)
      const surgeActive = cfg['surge_active'] === true;
      if (surgeActive) {
        upsFixedInr += Number(cfg['surge_amount'] ?? 0);
      }
      // US inbound surcharge — auto (PDF: ₹230 per shipment extra for USA)
      if (input.destination === 'USA') {
        usInboundInr = UPS_US_INBOUND;
      }
      // Customer-selectable options
      const opts = input.upsOptions ?? {};
      if (opts.formalClearance) upsFixedInr += UPS_FORMAL_CLEARANCE;
      if (opts.ddp)             upsFixedInr += UPS_DDP;
      if (opts.signature)       upsFixedInr += UPS_SIGNATURE;
      // Remote area (staff-flagged, not in customer quote by default)
      if (opts.remoteArea) {
        upsFixedInr += Math.max(UPS_REMOTE_PER_KG * effectiveChargeable, UPS_REMOTE_MIN);
      }
      // Oversize fee (PDF: ₹9,450 if girth L+2W+2H >400cm)
      if (girth > 400) {
        upsFixedInr += UPS_OVERSIZE_FEE;
      }
    }

    // Step 5: packaging + insurance
    const packagingInr = PACKAGING_FEES[input.packaging];
    const insuranceInr = input.insurance ? INSURANCE_FEE : 0;

    // Step 6: GST on full subtotal
    const preGst = withMargin + fscInr + demandSurchargeInr
      + premiumServiceInr + peakSurchargeInr
      + usInboundInr + upsFixedInr
      + pickupSurcharge + packagingInr + insuranceInr;

    const { subtotal, gst, total } = applyGst(preGst);

    results.push({
      carrier,
      carrierName: CARRIER_NAMES[carrier],
      zone,
      chargeableWeightKg: effectiveChargeable,
      actualWeightKg: input.weightKg,
      volumetricWeightKg: volumetric,
      baseRateInr: priceInr,
      discountPct: 0,
      discountInr: 0,
      marginPct,
      marginInr,
      fscPct,
      fscInr,
      demandSurchargeInr,
      premiumServiceInr,
      peakSurchargeInr,
      usInboundInr,
      upsFixedInr,
      pickupSurchargeInr: pickupSurcharge,
      packagingInr,
      insuranceInr,
      subtotalInr: subtotal,
      gstInr: gst,
      totalInr: total,
      estimatedDeliveryDays: DELIVERY_DAYS[carrier]?.[zone] ?? "5-7",
      itemType: input.itemType,
    });
  }

  return results.sort((a, b) => a.totalInr - b.totalInr);
}
