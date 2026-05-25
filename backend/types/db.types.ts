// Supabase database row types — mirrors the schema.sql exactly.
// Re-generate with: npx supabase gen types typescript --project-id <id>

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type PackagingType = "none" | "standard" | "premium";

export interface DbCarrier {
  id: string;
  display_name: string;
  is_active: boolean;
  logo_url: string | null;
  created_at: string;
}

export interface DbCarrierZone {
  id: string;
  carrier_id: string;
  origin_country: string;
  destination_country: string;
  zone_code: string;
  effective_from: string;
  effective_to: string | null;
}

export interface DbRateCardSlab {
  id: string;
  carrier_id: string;
  zone_code: string;
  weight_min_kg: number;
  weight_max_kg: number | null;
  price_inr: number;
  price_per_kg: number;
  effective_from: string;
  effective_to: string | null;
}

export interface DbFuelSurcharge {
  id: string;
  carrier_id: string;
  fsc_percent: number;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
}

export interface DbItemTypeDiscount {
  item_type_id: string;
  display_name: string;
  discount_pct: number;
  requires_docs: boolean;
  notes: string | null;
}

export interface DbPickupZone {
  pincode: string;
  city_name: string;
  surcharge_inr: number;
  tier: string;
}

export type DhlService = "standard" | "premium_900" | "premium_1200";
export type FedexService = "IP" | "IPF";
export type UpsDeliveryType = "DDU" | "DDP";

export interface DbBooking {
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
  packaging_type: PackagingType;
  insurance_opted: boolean;
  // Pricing snapshot (locked at booking time)
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
  // Carrier-specific options (locked at booking time)
  dhl_service: DhlService;
  fedex_service: FedexService;
  ups_formal_clearance: boolean;
  ups_delivery_type: UpsDeliveryType;
  ups_signature: boolean;
  ups_remote_area: boolean;
  // Sender / pickup info
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
  // Receiver / delivery info
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
}

export interface DbSurchargeConfig {
  id: number;
  carrier_id: string;
  key: string;
  value_num: number | null;
  value_bool: boolean | null;
  updated_at: string;
}

export interface DbTrackingEvent {
  id: string;
  booking_id: string;
  tracking_number: string;
  event_code: string;
  description: string;
  location: string | null;
  event_at: string;
  created_at: string;
}

export interface DbMembershipPlan {
  id: string;
  name: string;
  price_inr: number;
  discount_pct: number;
  duration_months: number;
}

export interface DbUserMembership {
  id: string;
  user_id: string;
  plan_id: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}
