/**
 * TypeScript types for all API responses.
 * Mirrors server/types/ and shared/schemas/ — kept in sync manually.
 */

// ── Carriers ──────────────────────────────────────────────────────────────────
export type CarrierSlug = "dhl" | "fedex" | "ups" | "aramex";
export type ItemType =
  | "university" | "excess" | "docs" | "food" | "clothing"
  | "medicine" | "jewellery" | "electronics" | "cosmetics" | "gifts"
  | "sports" | "pooja" | "commercial" | "other";

// ── Rate Calculation ──────────────────────────────────────────────────────────
export interface UpsRateOptions {
  formalClearance?: boolean;
  ddp?: boolean;
  signature?: boolean;
}

export interface RateRequest {
  origin: string;
  destination: string;
  weight: number;
  shipmentType?: "document" | "package";
  itemType: ItemType;
  dims?: { l: number; w: number; h: number };
  pickupPincode?: string;
  carrier?: CarrierSlug;
  packaging?: "none" | "standard" | "premium";
  insurance?: boolean;
  dhlService?: "standard" | "premium_900" | "premium_1200";
  fedexService?: "IP" | "IPF";
  upsOptions?: UpsRateOptions;
}

export interface RateResult {
  carrier: CarrierSlug;
  carrierName: string;
  zone: string;
  chargeableWeightKg: number;
  actualWeightKg: number;
  volumetricWeightKg: number | null;
  baseRateInr: number;
  discountPct: number;
  discountInr: number;
  marginPct: number;
  marginInr: number;
  fscPct: number;
  fscInr: number;
  demandSurchargeInr: number;
  premiumServiceInr: number;
  peakSurchargeInr: number;
  usInboundInr: number;
  formalClearanceInr: number;
  ddpInr: number;
  signatureInr: number;
  remoteAreaInr: number;
  oversizeFeeInr: number;
  upsFixedInr: number;
  pickupSurchargeInr: number;
  packagingInr: number;
  insuranceInr: number;
  subtotalInr: number;
  gstInr: number;
  totalInr: number;
  estimatedDeliveryDays: string;
  itemType: ItemType;
}

// ── Tracking ──────────────────────────────────────────────────────────────────
export interface TrackingEvent {
  event_code: string;
  description: string;
  location: string | null;
  event_at: string;
}

export interface TrackingResponse {
  trackingId: string;
  bookingRef?: string;
  carrier?: string;
  status?: string;
  events: TrackingEvent[];
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export interface BookingCreate {
  carrierId: CarrierSlug;
  originCountry: string;
  destinationCountry: string;
  actualWeightKg: number;
  shipmentType?: "document" | "package";
  itemTypeId: ItemType;
  packaging: "none" | "standard" | "premium";
  insurance: boolean;
  dhlService?: "standard" | "premium_900" | "premium_1200";
  fedexService?: "IP" | "IPF";
  upsOptions?: UpsRateOptions;
  senderCompany: string;
  senderMobile: string;
  senderTelephone?: string;
  senderEmail?: string | null;
  senderKyc?: string;
  pickupPincode: string;
  pickupAddress1: string;
  pickupAddress2?: string;
  pickupCity: string;
  pickupState: string;
  pickupDate: string;
  pickupSlot: string;
  receiverCompany: string;
  receiverMobile: string;
  receiverTelephone?: string;
  receiverEmail?: string | null;
  deliveryAddress1: string;
  deliveryAddress2?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  numPieces: number;
  contentsDesc?: string;
  shipperReference?: string;
  specialInstruction?: string;
  declaredValue?: number;
  declaredCurrency?: string;
  dims?: { l: number; w: number; h: number };
}

export interface BookingResponse {
  id: string;
  booking_ref: string;
  status: string;
  carrier_id: string;
  total_inr: number;
  tracking_number: string | null;
  created_at: string;
  // Sender / receiver info echoed back
  sender_company: string;
  receiver_company: string;
  destination_country: string;
  actual_weight_kg: number;
  chargeable_weight_kg: number;
  subtotal_inr: number;
  gst_inr: number;
  base_rate_inr: number;
  fsc_inr: number;
  discount_inr: number;
  pickup_surcharge_inr: number;
  packaging_inr: number;
  insurance_inr: number;
}

// ── Membership ────────────────────────────────────────────────────────────────
export interface MembershipPlan {
  id: string;
  name: string;
  price_inr: number;
  discount_pct: number;   // e.g. 0.10 = 10%
  duration_months: number;
}

export interface MembershipSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

// ── Pincode ───────────────────────────────────────────────────────────────────
export interface PincodeResult {
  serviceable: boolean;
  city?: string;
  state?: string;
  surchargeInr?: number;
  tier?: string;
  source?: string;
}
