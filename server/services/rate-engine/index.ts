import { supabase } from "../../config/supabase.js";
import type {
  RateEngineInput,
  RateResult,
  CarrierSlug,
} from "../../types/rate-engine.types.js";
import { CARRIERS } from "../../../shared/schemas/rate-request.schema.js";
import { chargeableWeight } from "./weight-calc.js";
import { resolveZone } from "./zone-resolver.js";
import { getFscPercent, applyFsc } from "./fsc.js";
import { applyGst } from "./gst.js";

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

const INSURANCE_FEE = 199;

/**
 * Core rate calculation pipeline.
 *
 * Steps:
 *  1. Determine chargeable weight (actual vs volumetric)
 *  2. Resolve zone per carrier from Supabase
 *  3. Look up rate card slab from Supabase
 *  4. Apply item-type discount
 *  5. Add fuel surcharge (FSC)
 *  6. Add pickup surcharge (if pincode found)
 *  7. Add packaging + insurance fees
 *  8. Apply 18% GST
 */
export async function calculateRates(
  input: RateEngineInput
): Promise<RateResult[]> {
  const carriers: CarrierSlug[] = input.carrier
    ? [input.carrier]
    : [...CARRIERS];

  // 1. Chargeable weight
  const { chargeable, volumetric } = chargeableWeight(input.weightKg, input.dims);

  // 2. Fetch constants in parallel (item discount, pickup surcharge, all fuel surcharges)
  const [discountPct, pickupSurcharge, fscMap] = await Promise.all([
    getItemDiscount(input.itemType),
    input.pickupPincode ? getPickupSurcharge(input.pickupPincode) : Promise.resolve(0),
    Promise.all(
      carriers.map(async (c) => ({ carrier: c, fsc: await getFscPercent(c) }))
    ).then((list) =>
      list.reduce((acc, curr) => {
        acc[curr.carrier] = curr.fsc;
        return acc;
      }, {} as Record<CarrierSlug, number>)
    ),
  ]);

  // 3. Calculate each carrier in parallel
  const results = await Promise.all(
    carriers.map((carrier) =>
      calculateSingleCarrier({
        carrier,
        input,
        chargeable,
        volumetric,
        discountPct,
        pickupSurcharge,
        fscPct: fscMap[carrier],
      })
    )
  );

  // Filter out null (carrier not available for route), sort by total
  return results
    .filter((r): r is RateResult => r !== null)
    .sort((a, b) => a.totalInr - b.totalInr);
}

async function calculateSingleCarrier(params: {
  carrier: CarrierSlug;
  input: RateEngineInput;
  chargeable: number;
  volumetric: number | null;
  discountPct: number;
  pickupSurcharge: number;
  fscPct: number;
}): Promise<RateResult | null> {
  const { carrier, input, chargeable, volumetric, discountPct, pickupSurcharge, fscPct } =
    params;

  // Step A: Resolve zone
  const zoneResult = await resolveZone(carrier, input.origin, input.destination);
  if (!zoneResult) return null; // carrier doesn't serve this route

  const { zone, deliveryDays } = zoneResult;

  // Step B: Get rate card entry (step or band)
  const entry = await getRateCardEntry(carrier, zone, chargeable, input.shipmentType);
  if (!entry) return null;

  // Step C: Base rate (already the final INR amount for the weight)
  const baseRate = entry.price_inr;

  // Step D: Discount
  const discountInr = round2(baseRate * discountPct);
  const discountedBase = round2(baseRate - discountInr);

  // Step E: FSC
  const fscInr = applyFsc(discountedBase, fscPct);

  // Step F: Packaging + insurance
  const packagingInr = PACKAGING_FEES[input.packaging];
  const insuranceInr = input.insurance ? INSURANCE_FEE : 0;

  // Step G: Subtotal before GST
  const preGst =
    discountedBase +
    fscInr +
    pickupSurcharge +
    packagingInr +
    insuranceInr;

  // Step H: GST
  const { subtotal, gst, total } = applyGst(preGst);

  return {
    carrier,
    carrierName: CARRIER_NAMES[carrier],
    zone,
    chargeableWeightKg: chargeable,
    actualWeightKg: input.weightKg,
    volumetricWeightKg: volumetric,
    baseRateInr: round2(baseRate),
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
    estimatedDeliveryDays: deliveryDays,
    itemType: input.itemType,
  };
}

/**
 * Look up the total INR price for a given weight.
 * 1. Try an exact match in rate_card_steps (step pricing).
 * 2. If not found (weight exceeds highest step), fall back to rate_card_bands.
 *    - additive band:       base_price_inr + (weight - weight_min_kg) × price_per_kg
 *    - multiplicative band: weight × price_per_kg
 */
async function getRateCardEntry(
  carrier: CarrierSlug,
  zone: string,
  weightKg: number,
  shipmentType: "document" | "package"
): Promise<{ price_inr: number } | null> {
  const today = new Date().toISOString().split("T")[0];

  // ── Step table lookup ───────────────────────────────────────────────────────
  const { data: step } = await supabase
    .from("rate_card_steps")
    .select("price_inr")
    .eq("carrier_id", carrier)
    .eq("zone_code", zone)
    .eq("shipment_type", shipmentType)
    .eq("weight_kg", weightKg)
    .or(`effective_to.is.null,effective_to.gte.${today}`)
    .limit(1)
    .maybeSingle();

  if (step) return { price_inr: Number(step.price_inr) };

  // ── Band fallback ───────────────────────────────────────────────────────────
  const { data: band } = await supabase
    .from("rate_card_bands")
    .select("price_per_kg, base_price_inr, band_type, weight_min_kg")
    .eq("carrier_id", carrier)
    .eq("zone_code", zone)
    .eq("shipment_type", shipmentType)
    .lte("weight_min_kg", weightKg)
    .or(`weight_max_kg.is.null,weight_max_kg.gte.${weightKg}`)
    .or(`effective_to.is.null,effective_to.gte.${today}`)
    .order("weight_min_kg", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!band) return null;

  const perKg = Number(band.price_per_kg);
  const base = Number(band.base_price_inr);
  const wMin = Number(band.weight_min_kg);

  const price_inr =
    band.band_type === "additive"
      ? base + (weightKg - wMin) * perKg
      : weightKg * perKg; // multiplicative

  return { price_inr };
}

async function getItemDiscount(itemType: string): Promise<number> {
  const { data, error } = await supabase
    .from("item_type_discounts")
    .select("discount_pct")
    .eq("item_type_id", itemType)
    .single();

  if (error || !data) return 0;
  return Number(data.discount_pct);
}

async function getPickupSurcharge(pincode: string): Promise<number> {
  const { data, error } = await supabase
    .from("pickup_zones")
    .select("surcharge_inr")
    .eq("pincode", pincode)
    .single();

  if (error || !data) return 0;
  return Number(data.surcharge_inr);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
