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
  marginPct: number;           // internal — do NOT show to customer
  marginInr: number;           // internal — do NOT show to customer
  fscPct: number;
  fscInr: number;
  demandSurchargeInr: number;
  premiumServiceInr: number;   // DHL premium 9am/12pm
  peakSurchargeInr: number;    // FedEx seasonal
  usInboundInr: number;        // UPS: auto ₹230 for USA
  formalClearanceInr: number;  // UPS
  ddpInr: number;              // UPS
  signatureInr: number;        // UPS
  remoteAreaInr: number;       // UPS
  oversizeFeeInr: number;      // UPS
  upsFixedInr: number;         // UPS: formal clearance + DDP + signature
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

export interface UpsOptions {
  formalClearance?: boolean;
  ddp?: boolean;
  signature?: boolean;
  remoteArea?: boolean;    // staff-flagged at booking, not customer-facing in quote
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
  // Carrier-specific options
  dhlService?: "standard" | "premium_900" | "premium_1200";
  fedexService?: "IP" | "IPF";
  upsOptions?: UpsOptions;
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
