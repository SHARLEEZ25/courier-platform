import { supabase } from "../../config/supabase.js";
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

// ── Module-level cache (persists across warm Vercel invocations) ──────────────
// FSC rates and item discounts change at most monthly — safe to cache for 1 hour.
// Zone and rate-card data are cached per route+weight for 30 minutes.
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

const TTL_1H  = 60 * 60 * 1000;
const TTL_30M = 30 * 60 * 1000;

// Explicit row types used in cache generics
type ZoneCacheRow  = { carrier_id: string; zone_code: string };
type FscCacheRow   = { carrier_id: string; fsc_percent: number };
type StepCacheRow  = { carrier_id: string; zone_code: string; price_inr: number };
type BandCacheRow  = { carrier_id: string; zone_code: string; price_per_kg: number; base_price_inr: number; band_type: string; weight_min_kg: number };
type RateCardCache = { stepRows: StepCacheRow[]; bandRows: BandCacheRow[] };

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

/**
 * Core rate calculation pipeline — batched edition.
 *
 * Wave 1 (all in parallel): zones, FSC, item discount, pickup surcharge
 * Wave 2 (all in parallel): rate card steps, rate card bands
 * Wave 3: pure math — no more DB calls
 */
export async function calculateRates(
  input: RateEngineInput
): Promise<RateResult[]> {
  const carriers: CarrierSlug[] = input.carrier
    ? [input.carrier]
    : [...CARRIERS];

  const today = new Date().toISOString().split("T")[0];
  const { chargeable, volumetric } = chargeableWeight(input.weightKg, input.dims);

  // ── Wave 1: fetch reference data (cached where safe) ─────────────────────
  const zoneKey     = `zones:${input.origin}:${input.destination}`;
  const fscKey      = `fsc:${today}`;
  const discountKey = `discount:${input.itemType}`;
  const rateKey     = `rates:${input.origin}:${input.destination}:${chargeable}:${input.shipmentType}`;

  const [zoneRows, fscRows, discountRow, surchargeRow] = await Promise.all([
    // Zones: cached 30 min (changes quarterly)
    cacheGet<ZoneCacheRow[]>(zoneKey) ??
      supabase
        .from("carrier_zones")
        .select("carrier_id, zone_code")
        .in("carrier_id", carriers)
        .eq("origin_country", input.origin)
        .eq("destination_country", input.destination)
        .or(`effective_to.is.null,effective_to.gte.${today}`)
        .order("effective_from", { ascending: false })
        .then((r) => cacheSet<ZoneCacheRow[]>(zoneKey, r.data ?? [], TTL_30M)),

    // FSC: cached 1 hour (changes monthly)
    cacheGet<FscCacheRow[]>(fscKey) ??
      supabase
        .from("fuel_surcharges")
        .select("carrier_id, fsc_percent")
        .in("carrier_id", carriers)
        .lte("effective_from", today)
        .or(`effective_to.is.null,effective_to.gte.${today}`)
        .order("effective_from", { ascending: false })
        .then((r) => cacheSet<FscCacheRow[]>(fscKey, r.data ?? [], TTL_1H)),

    // Item discount: cached 1 hour (changes rarely)
    cacheGet<{ discount_pct: number } | null>(discountKey) ??
      supabase
        .from("item_type_discounts")
        .select("discount_pct")
        .eq("item_type_id", input.itemType)
        .maybeSingle()
        .then((r) => cacheSet(discountKey, r.data, TTL_1H)),

    // Pickup surcharge: not cached (pincode-specific, skip if absent)
    input.pickupPincode
      ? supabase
          .from("pickup_zones")
          .select("surcharge_inr")
          .eq("pincode", input.pickupPincode)
          .maybeSingle()
          .then((r) => r.data)
      : Promise.resolve(null),
  ]);

  // Build lookup maps from wave 1 results
  const zoneMap = new Map<CarrierSlug, string>();
  // Keep only the most recent zone per carrier (rows already ordered desc)
  for (const row of zoneRows) {
    if (!zoneMap.has(row.carrier_id as CarrierSlug)) {
      zoneMap.set(row.carrier_id as CarrierSlug, row.zone_code as string);
    }
  }

  const fscMap = new Map<CarrierSlug, number>();
  for (const row of fscRows) {
    if (!fscMap.has(row.carrier_id as CarrierSlug)) {
      fscMap.set(row.carrier_id as CarrierSlug, Number(row.fsc_percent));
    }
  }

  const discountPct = discountRow ? Number(discountRow.discount_pct) : 0;
  const pickupSurcharge = surchargeRow ? Number(surchargeRow.surcharge_inr) : 0;

  // Only proceed with carriers that have a zone for this route
  const activeCarriers = carriers.filter((c) => zoneMap.has(c));
  if (activeCarriers.length === 0) return [];

  // Build (carrier, zone) pairs for rate card queries
  const pairs = activeCarriers.map((c) => ({
    carrier: c,
    zone: zoneMap.get(c)!,
  }));

  // ── Wave 2: rate card data (cached 30 min per route+weight) ─────────────
  const cachedRates = cacheGet<RateCardCache>(rateKey);
  const zones = pairs.map((p) => p.zone);

  const { stepRows, bandRows } = cachedRates ?? await (async () => {
    const [s, b] = await Promise.all([
      supabase
        .from("rate_card_steps")
        .select("carrier_id, zone_code, price_inr")
        .in("carrier_id", activeCarriers)
        .in("zone_code", zones)
        .eq("shipment_type", input.shipmentType)
        .eq("weight_kg", chargeable)
        .or(`effective_to.is.null,effective_to.gte.${today}`)
        .then((r) => (r.data ?? []) as StepCacheRow[]),

      supabase
        .from("rate_card_bands")
        .select("carrier_id, zone_code, price_per_kg, base_price_inr, band_type, weight_min_kg")
        .in("carrier_id", activeCarriers)
        .in("zone_code", zones)
        .eq("shipment_type", input.shipmentType)
        .lte("weight_min_kg", chargeable)
        .or(`weight_max_kg.is.null,weight_max_kg.gte.${chargeable}`)
        .or(`effective_to.is.null,effective_to.gte.${today}`)
        .order("weight_min_kg", { ascending: false })
        .then((r) => (r.data ?? []) as BandCacheRow[]),
    ]);
    return cacheSet<RateCardCache>(rateKey, { stepRows: s, bandRows: b }, TTL_30M);
  })();

  // Build step lookup: "carrier:zone" → price_inr
  const stepKey = (c: string, z: string) => `${c}:${z}`;
  const stepLookup = new Map<string, number>();
  for (const row of stepRows) {
    const k = stepKey(row.carrier_id, row.zone_code);
    if (!stepLookup.has(k)) stepLookup.set(k, Number(row.price_inr));
  }

  // Build band lookup: "carrier:zone" → first matching band (already ordered desc by weight_min_kg)
  const bandLookup = new Map<string, BandCacheRow>();
  for (const row of bandRows) {
    const k = stepKey(row.carrier_id, row.zone_code);
    if (!bandLookup.has(k)) bandLookup.set(k, row);
  }

  // ── Wave 3: pure math, no DB ──────────────────────────────────────────────
  const results: RateResult[] = [];

  for (const { carrier, zone } of pairs) {
    const k = stepKey(carrier, zone);

    // Get price: prefer step, fall back to band
    let priceInr: number | null = null;
    if (stepLookup.has(k)) {
      priceInr = stepLookup.get(k)!;
    } else if (bandLookup.has(k)) {
      const band = bandLookup.get(k)!;
      const perKg = Number(band.price_per_kg);
      const base = Number(band.base_price_inr);
      const wMin = Number(band.weight_min_kg);
      priceInr =
        band.band_type === "additive"
          ? base + (chargeable - wMin) * perKg
          : chargeable * perKg;
    }

    if (priceInr === null) continue; // no rate card entry for this carrier/zone

    const fscPct = fscMap.get(carrier) ?? FALLBACK_FSC[carrier] ?? 27.0;
    const discountInr = round2(priceInr * discountPct);
    const discountedBase = round2(priceInr - discountInr);
    const fscInr = applyFsc(discountedBase, fscPct);
    const packagingInr = PACKAGING_FEES[input.packaging];
    const insuranceInr = input.insurance ? INSURANCE_FEE : 0;

    const preGst = discountedBase + fscInr + pickupSurcharge + packagingInr + insuranceInr;
    const { subtotal, gst, total } = applyGst(preGst);

    results.push({
      carrier,
      carrierName: CARRIER_NAMES[carrier],
      zone,
      chargeableWeightKg: chargeable,
      actualWeightKg: input.weightKg,
      volumetricWeightKg: volumetric,
      baseRateInr: round2(priceInr),
      discountPct,
      discountInr,
      fscPct,
      fscInr,
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

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
