import type { CarrierSlug, ItemType } from "../../shared/schemas/rate-request.schema.js";

export type { CarrierSlug, ItemType };

export interface RateResult {
  carrier: CarrierSlug;
  carrierName: string;
  zone: string;
  chargeableWeightKg: number;
  actualWeightKg: number;
  volumetricWeightKg: number | null;
  // Pricing breakdown
  baseRateInr: number;
  discountPct: number;
  discountInr: number;
  fscPct: number;
  fscInr: number;
  pickupSurchargeInr: number;
  packagingInr: number;
  insuranceInr: number;
  subtotalInr: number;
  gstInr: number;
  totalInr: number;
  // Meta
  estimatedDeliveryDays: string;
  itemType: ItemType;
}

export interface RateEngineInput {
  origin: string;
  destination: string;
  weightKg: number;
  shipmentType: "document" | "package";
  itemType: ItemType;
  dims?: { l: number; w: number; h: number };
  pickupPincode?: string;
  carrier?: CarrierSlug;
  packaging: "none" | "standard" | "premium";
  insurance: boolean;
}

export interface ZoneRow {
  carrier_id: CarrierSlug;
  zone_code: string;
}

export interface RateCardSlab {
  price_inr: number;
  price_per_kg: number;
}

export interface FuelSurcharge {
  fsc_percent: number;
}

export interface ItemTypeDiscount {
  discount_pct: number;
}

export interface PickupZone {
  surcharge_inr: number;
}
