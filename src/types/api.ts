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

// ── Admin ─────────────────────────────────────────────────────────────────────
export type BookingStatus =
  | "pending" | "confirmed" | "picked_up" | "in_transit" | "delivered" | "cancelled";

export interface AdminMe {
  uid: string;
  email: string;
  name: string;
}

/** Full booking row as returned by GET /api/admin/bookings/:id */
export interface AdminBookingDetail {
  id: string;
  user_id: string | null;
  booking_ref: string;
  status: BookingStatus;
  carrier_id: string;
  tracking_number: string | null;
  origin_country: string;
  destination_country: string;
  actual_weight_kg: number;
  volumetric_weight_kg: number | null;
  chargeable_weight_kg: number;
  item_type_id: string;
  packaging_type: string;
  insurance_opted: boolean;
  // Pricing
  base_rate_inr: number;
  discount_inr: number;
  margin_inr: number;
  fsc_inr: number;
  demand_surcharge_inr: number;
  premium_service_inr: number;
  peak_surcharge_inr: number;
  us_inbound_inr: number;
  ups_fixed_inr: number;
  pickup_surcharge_inr: number;
  packaging_inr: number;
  insurance_inr: number;
  subtotal_inr: number;
  gst_inr: number;
  total_inr: number;
  // Carrier-specific
  dhl_service: string;
  fedex_service: string;
  ups_formal_clearance: boolean;
  ups_delivery_type: string;
  ups_signature: boolean;
  ups_remote_area: boolean;
  // Sender
  sender_company: string;
  sender_mobile: string;
  sender_telephone: string;
  sender_email: string | null;
  sender_kyc: string;
  pickup_pincode: string;
  pickup_address_1: string;
  pickup_address_2: string;
  pickup_city: string;
  pickup_state: string;
  pickup_date: string;
  pickup_slot: string;
  // Receiver
  receiver_company: string;
  receiver_mobile: string;
  receiver_telephone: string;
  receiver_email: string | null;
  delivery_address_1: string;
  delivery_address_2: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip: string;
  num_pieces: number;
  contents_desc: string | null;
  shipper_reference: string;
  special_instruction: string;
  created_at: string;
  updated_at: string;
  tracking_events: AdminTrackingEvent[];
}

export interface AdminTrackingEvent {
  id: string;
  booking_id: string;
  tracking_number: string;
  event_code: string;
  description: string;
  location: string | null;
  event_at: string;
  created_at: string;
}

/** Row returned in the bookings list (same as detail minus tracking_events) */
export type AdminBookingListItem = Omit<AdminBookingDetail, "tracking_events">;

export interface AdminBookingsResponse {
  bookings: AdminBookingListItem[];
  total: number;
}

export interface AdminDashboardStats {
  bookings_today: number;
  bookings_this_week: number;
  pending_count: number;
  inscanned_count: number;
  outscanned_count: number;
  delivered_count: number;
  revenue_today: number;
  revenue_this_week: number;
  unassigned_pickups: number;
  cancelled_count: number;
  outscan_queue_count: number;
  ndr_count: number;
}

/** Surcharge config grouped by carrier: { dhl: { margin_pct: 20, demand_active: false, ... } } */
export type AdminSurchargeConfig = Record<string, Record<string, number | boolean | null>>;

export interface AdminFuelSurcharge {
  id: string;
  carrier_id: string;
  fsc_percent: number;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
}

export interface AdminStaff {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: "pickup_agent" | "ops_staff" | "admin";
  is_active: boolean;
  active_bookings_count: number;
  created_at: string;
}

export interface AdminLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: "chat" | "contact_form" | "quote";
  message: string | null;
  status: "new" | "contacted" | "converted" | "lost";
  created_at: string;
}

export interface AdminNDRRecord {
  id: string;
  booking_id: string;
  booking_ref: string;
  customer_name: string;
  awb: string | null;
  carrier_id: string;
  destination_country: string;
  last_attempt_at: string;
  ndr_reason: string | null;
  status: "unresolved" | "reattempt_scheduled" | "resolved";
  attempt_count: number;
}

export interface AdminRemarketingRecord {
  booking_id: string;
  booking_ref: string;
  customer_email: string;
  delivered_at: string;
  email_status: "pending" | "sent" | "failed";
  sent_at: string | null;
}

export interface InscanPayload {
  actual_weight_kg: number;
}

export interface AssignTrackingPayload {
  tracking_number: string;
}
