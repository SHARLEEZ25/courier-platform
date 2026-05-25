import type { Context } from "hono";
import {
  createBooking,
  generateBookingRef,
  getBookingById,
  getBookingsByUser,
} from "../db/queries/bookings.queries.js";
import { calculateRates } from "../services/rate-engine/index.js";
import { ok, err } from "../types/api.types.js";
import type { BookingCreate } from "../../shared/schemas/booking.schema.js";

export async function handleCreateBooking(c: Context) {
  const body = c.get("validatedBody") as BookingCreate;
  const user = c.get("user"); // may be undefined for guest bookings

  try {
    // Recalculate the rate server-side to prevent price manipulation
    const rates = await calculateRates({
      origin: body.originCountry,
      destination: body.destinationCountry,
      weightKg: body.actualWeightKg,
      shipmentType: body.shipmentType,
      itemType: body.itemTypeId,
      pickupPincode: body.pickupPincode,
      carrier: body.carrierId,
      packaging: body.packaging,
      insurance: body.insurance,
    });

    const rate = rates.find((r) => r.carrier === body.carrierId);
    if (!rate) {
      console.error("[bookings.controller] carrier not in results:", {
        requested: body.carrierId,
        route: `${body.originCountry} → ${body.destinationCountry}`,
        weight: body.actualWeightKg,
        shipmentType: body.shipmentType,
        availableCarriers: rates.map((r) => r.carrier),
      });
      return c.json(
        err("Selected carrier is not available for this route."),
        400
      );
    }

    const booking = await createBooking({
      user_id: user.id,
      booking_ref: generateBookingRef(),
      status: "pending",
      carrier_id: body.carrierId,
      origin_country: body.originCountry,
      destination_country: body.destinationCountry,
      actual_weight_kg: body.actualWeightKg,
      volumetric_weight_kg: rate.volumetricWeightKg,
      chargeable_weight_kg: rate.chargeableWeightKg,
      item_type_id: body.itemTypeId,
      packaging_type: body.packaging,
      insurance_opted: body.insurance,
      base_rate_inr: rate.baseRateInr,
      discount_inr: rate.discountInr,
      margin_inr: rate.marginInr,
      fsc_inr: rate.fscInr,
      demand_surcharge_inr: rate.demandSurchargeInr,
      premium_service_inr: rate.premiumServiceInr,
      peak_surcharge_inr: rate.peakSurchargeInr,
      us_inbound_inr: rate.usInboundInr,
      ups_fixed_inr: rate.upsFixedInr,
      pickup_surcharge_inr: rate.pickupSurchargeInr,
      packaging_inr: rate.packagingInr,
      insurance_inr: rate.insuranceInr,
      subtotal_inr: rate.subtotalInr,
      gst_inr: rate.gstInr,
      total_inr: rate.totalInr,
      dhl_service: (body.dhlService ?? "standard") as "standard" | "premium_900" | "premium_1200",
      fedex_service: "IP" as "IP" | "IPF",
      ups_formal_clearance: body.upsOptions?.formalClearance ?? false,
      ups_delivery_type: (body.upsOptions?.ddp ? "DDP" : "DDU") as "DDU" | "DDP",
      ups_signature: body.upsOptions?.signature ?? false,
      ups_remote_area: body.upsOptions?.remoteArea ?? false,
      sender_company: body.senderCompany,
      sender_mobile: body.senderMobile,
      sender_telephone: body.senderTelephone ?? "",
      sender_email: body.senderEmail ?? null,
      sender_kyc: body.senderKyc ?? "",
      pickup_pincode: body.pickupPincode,
      pickup_address_1: body.pickupAddress1,
      pickup_address_2: body.pickupAddress2 ?? "",
      pickup_city: body.pickupCity ?? "",
      pickup_state: body.pickupState ?? "",
      pickup_date: body.pickupDate,
      pickup_slot: body.pickupSlot,
      receiver_company: body.receiverCompany,
      receiver_mobile: body.receiverMobile,
      receiver_telephone: body.receiverTelephone ?? "",
      receiver_email: body.receiverEmail ?? null,
      delivery_address_1: body.deliveryAddress1,
      delivery_address_2: body.deliveryAddress2 ?? "",
      delivery_city: body.deliveryCity,
      delivery_state: body.deliveryState,
      delivery_zip: body.deliveryZip,
      num_pieces: body.numPieces,
      contents_desc: body.contentsDesc ?? null,
      shipper_reference: body.shipperReference ?? "",
      special_instruction: body.specialInstruction ?? "",
      tracking_number: null,
    });

    return c.json(ok(booking), 201);
  } catch (e) {
    console.error("[bookings.controller] createBooking error:", e);
    return c.json(err("Failed to create booking. Please try again."), 500);
  }
}

export async function handleGetBooking(c: Context) {
  const id = c.req.param("id") ?? "";

  try {
    const booking = await getBookingById(id);
    if (!booking) return c.json(err("Booking not found."), 404);

    // Only allow the owner or guests with the booking ref to view
    const user = c.get("user");
    if (booking.user_id !== user.id) {
      return c.json(err("Forbidden."), 403);
    }

    return c.json(ok(booking));
  } catch (e) {
    console.error("[bookings.controller] getBooking error:", e);
    return c.json(err("Failed to fetch booking."), 500);
  }
}

export async function handleListBookings(c: Context) {
  const user = c.get("user");

  try {
    const bookings = await getBookingsByUser(user.id);
    return c.json(ok(bookings));
  } catch (e) {
    console.error("[bookings.controller] listBookings error:", e);
    return c.json(err("Failed to fetch bookings."), 500);
  }
}
