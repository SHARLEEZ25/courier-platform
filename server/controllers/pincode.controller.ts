import type { Context } from "hono";
import { sql } from "../config/db.js";
import { ok, err } from "../types/api.types.js";

// Surcharge by state for pincodes not in our pickup_zones table
const STATE_SURCHARGE: Record<string, number> = {
  "Tamil Nadu":          0,
  "Delhi":               200,
  "Maharashtra":         200,
  "Karnataka":           200,
  "Telangana":           200,
  "West Bengal":         200,
  "Gujarat":             300,
  "Rajasthan":           400,
  "Uttar Pradesh":       400,
  "Madhya Pradesh":      400,
  "Bihar":               400,
  "Punjab":              400,
  "Haryana":             400,
  "Odisha":              400,
  "Andhra Pradesh":      300,
  "Kerala":              200,
  "Jharkhand":           400,
  "Assam":               500,
  "Uttarakhand":         400,
  "Himachal Pradesh":    500,
  "Jammu and Kashmir":   500,
  "Chhattisgarh":        400,
};

const DEFAULT_SURCHARGE = 400;

async function lookupIndiaPost(
  pincode: string
): Promise<{ city: string; state: string } | null> {
  try {
    const res = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;

    const json = (await res.json()) as Array<{
      Status: string;
      PostOffice: Array<{ District: string; State: string }> | null;
    }>;

    if (json[0]?.Status !== "Success" || !json[0].PostOffice?.length) {
      return null;
    }

    const po = json[0].PostOffice[0];
    return { city: po.District, state: po.State };
  } catch {
    return null;
  }
}

export async function handlePincodeLookup(c: Context) {
  const { pincode } = c.get("validatedBody") as { pincode: string };

  try {
    const [zoneRows, indiaPost] = await Promise.all([
      sql`
        SELECT city_name, surcharge_inr, tier
        FROM pickup_zones
        WHERE pincode = ${pincode}
        LIMIT 1
      `,
      lookupIndiaPost(pincode),
    ]);

    const data = zoneRows[0];

    if (data) {
      return c.json(
        ok({
          serviceable: true,
          city: data.city_name,
          state: indiaPost?.state ?? "",
          surchargeInr: Number(data.surcharge_inr),
          tier: data.tier,
          source: "local",
        })
      );
    }

    if (!indiaPost) {
      return c.json(ok({ serviceable: false }));
    }

    const surchargeInr = STATE_SURCHARGE[indiaPost.state] ?? DEFAULT_SURCHARGE;

    return c.json(
      ok({
        serviceable: true,
        city: indiaPost.city,
        state: indiaPost.state,
        surchargeInr,
        tier: "other",
        source: "india_post",
      })
    );
  } catch (e) {
    console.error("[pincode.controller] lookup error:", e);
    return c.json(err("Failed to lookup pincode."), 500);
  }
}
