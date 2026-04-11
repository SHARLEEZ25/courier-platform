import { sql } from "../../config/db.js";
import type { CarrierSlug } from "../../types/rate-engine.types.js";

/**
 * Estimated delivery days per zone per carrier.
 * DHL zones : '1'–'14'  (numeric strings)
 * FedEx zones: 'A'–'Q'  (letter codes)
 * UPS zones  : '1'–'8','9','10' + 'USA'|'CANADA'|'AUSTRALIA'|'NEWZEAL'|'SINGAPORE'|'GERMANY'|'POLAND'|'NCL'
 * Aramex     : rough approximation (no real zone data yet)
 */
export const DELIVERY_DAYS: Record<CarrierSlug, Record<string, string>> = {
  dhl: {
    '1': '1-2',   // UAE, Bangladesh, Nepal, Sri Lanka, Maldives, Bhutan
    '2': '2-3',   // Hong Kong, Malaysia, Singapore, Thailand
    '3': '3-4',   // China
    '4': '2-3',   // Bahrain, Jordan, Kuwait, Oman, Pakistan, Qatar, Saudi Arabia
    '5': '3-4',   // SE Asia, Japan, South Korea, etc.
    '6': '4-5',   // New Zealand, Papua New Guinea
    '7': '3-5',   // Western Europe
    '8': '4-6',   // Eastern/Northern Europe, Israel, Turkey
    '9': '5-7',   // Canada, Mexico
    '10': '6-9',  // South America, Caribbean
    '11': '7-10', // Rest of World / difficult
    '12': '4-6',  // USA
    '13': '5-8',  // Africa (key markets)
    '14': '4-6',  // Australia
  },
  fedex: {
    'A': '1-2',   // UAE
    'B': '2-3',   // South Asia, Singapore, Pakistan
    'C': '3-5',   // Middle East difficult, Egypt, Myanmar, Syria, Yemen
    'D': '3-4',   // China, Hong Kong, Thailand
    'E': '3-5',   // SE Asia, Australia, Oceania
    'F': '3-5',   // Western Europe core
    'G': '4-6',   // USA, Mexico
    'H': '3-4',   // Japan
    'I': '4-6',   // Rest of Europe (Eastern + Northern)
    'J': '6-9',   // Americas + Caribbean
    'K': '5-8',   // South Africa
    'L': '5-7',   // Canada
    'M': '2-3',   // Gulf (Bahrain, Kuwait, Oman, Qatar)
    'N': '5-8',   // East Africa + Mauritius + Sudan
    'O': '5-8',   // West/North Africa
    'P': '6-9',   // Southern Africa
    'Q': '6-10',  // West Africa + others
  },
  ups: {
    '1': '2-3',          // UAE, Bangladesh, Nepal, Sri Lanka
    '2': '3-4',          // HK, Macau, Malaysia, Taiwan, Thailand, Vietnam
    '3': '3-5',          // Bahrain, China, Indonesia, Japan, Jordan, Kuwait, Mid East
    '4': '4-5',          // Denmark, France, Italy, Luxembourg, Netherlands, Spain, Switzerland, UK
    '5': '5-7',          // Mexico
    '6': '4-6',          // Austria, Finland, Greece, Ireland, Norway, Portugal, Sweden
    '7': '5-8',          // Rest of World (South America, Africa)
    '8': '6-9',          // Eastern Europe, CIS, Russia, Ukraine
    '9': '5-8',          // Zone 9 (South China / generic)
    '10': '8-12',        // Remote / difficult destinations
    'USA': '4-6',
    'CANADA': '5-7',
    'AUSTRALIA': '5-7',
    'NEWZEAL': '5-7',
    'SINGAPORE': '2-3',
    'GERMANY': '4-5',
    'POLAND': '4-6',     // Poland, Czech Rep., Hungary, Romania
    'NCL': '5-8',        // New Caledonia, Mauritius, Maldives
  },
  aramex: {
    'Z1': '2-3',
    'Z2': '3-4',
    'Z3': '4-6',
    'Z4': '5-7',
    'Z5': '6-8',
    'Z6': '7-10',
  },
};

/**
 * Resolves the zone code for a given carrier + origin + destination.
 * Returns null if the route is not supported by this carrier.
 */
export async function resolveZone(
  carrier: CarrierSlug,
  origin: string,
  destination: string
): Promise<{ zone: string; deliveryDays: string } | null> {
  const today = new Date().toISOString().split("T")[0];

  const rows = await sql<{ zone_code: string }[]>`
    SELECT zone_code
    FROM carrier_zones
    WHERE carrier_id = ${carrier}
      AND origin_country = ${origin}
      AND destination_country = ${destination}
      AND (effective_to IS NULL OR effective_to >= ${today}::date)
    ORDER BY effective_from DESC
    LIMIT 1
  `;

  if (!rows[0]) return null;

  const zone = rows[0].zone_code;
  return {
    zone,
    deliveryDays: DELIVERY_DAYS[carrier]?.[zone] ?? "5-7",
  };
}
