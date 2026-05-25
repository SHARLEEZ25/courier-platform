import type { Context } from "hono";
import { calculateRates } from "../services/rate-engine/index.js";
import { getActiveCarriers } from "../db/queries/rates.queries.js";
import { ok, err } from "../types/api.types.js";
import type { RateRequest } from "../../shared/schemas/rate-request.schema.js";

export async function handleCalculateRates(c: Context) {
  const input = c.get("validatedBody") as RateRequest;

  try {
    const results = await calculateRates({
      origin: input.origin,
      destination: input.destination,
      weightKg: input.weight,
      shipmentType: input.shipmentType,
      itemType: input.itemType,
      dims:
        input.dims?.l != null && input.dims?.w != null && input.dims?.h != null
          ? { l: input.dims.l, w: input.dims.w, h: input.dims.h }
          : undefined,
      pickupPincode: input.pickupPincode,
      carrier: input.carrier,
      packaging: input.packaging ?? "none",
      insurance: input.insurance ?? false,
      dhlService: input.dhlService,
      upsOptions: input.upsOptions,
    });

    if (results.length === 0) {
      return c.json(
        err("No rates available for this route. Please contact support."),
        404
      );
    }

    return c.json(ok(results));
  } catch (e) {
    console.error("[rates.controller] calculateRates error:", e);
    return c.json(err("Failed to calculate rates. Please try again."), 500);
  }
}

export async function handleGetCarriers(c: Context) {
  try {
    const carriers = await getActiveCarriers();
    return c.json(ok(carriers));
  } catch (e) {
    console.error("[rates.controller] getCarriers error:", e);
    return c.json(err("Failed to fetch carriers."), 500);
  }
}
