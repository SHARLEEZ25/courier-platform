import { z } from "zod";

export const COUNTRIES = [
  "India",
  "USA",
  "Canada",
  "UK",
  "Australia",
  "New Zealand",
  "Germany",
  "France",
  "Netherlands",
  "Italy",
  "Spain",
  "UAE",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "Singapore",
  "Malaysia",
  "Hong Kong",
  "Japan",
  "South Korea",
  "China",
  "South Africa",
  "Nigeria",
  "Kenya",
  "Sweden",
  "Norway",
  "Denmark",
  "Switzerland",
  "Belgium",
  "Ireland",
  "Portugal",
  "Austria",
  "Thailand",
  "Brazil",
] as const;

export const ITEM_TYPES = [
  "university",
  "excess",
  "docs",
  "food",
  "clothing",
  "medicine",
  "jewellery",
  "electronics",
  "cosmetics",
  "gifts",
  "sports",
  "pooja",
  "commercial",
  "other",
] as const;

export const CARRIERS = ["dhl", "fedex", "ups", "aramex"] as const;

export const DimensionsSchema = z.object({
  l: z.number().positive(),
  w: z.number().positive(),
  h: z.number().positive(),
});

export const RateRequestSchema = z.object({
  origin: z.enum(COUNTRIES).default("India"),
  destination: z.enum(COUNTRIES),
  weight: z.number().positive().max(500),
  shipmentType: z.enum(["document", "package"]).default("package"),
  itemType: z.enum(ITEM_TYPES),
  dims: DimensionsSchema.optional(),
  pickupPincode: z
    .string()
    .regex(/^\d{6}$/, "Must be a 6-digit pincode")
    .optional(),
  carrier: z.enum(CARRIERS).optional(),
  packaging: z.enum(["none", "standard", "premium"]).optional().default("none"),
  insurance: z.boolean().optional().default(false),
});

export type RateRequest = z.infer<typeof RateRequestSchema>;
export type Dimensions = z.infer<typeof DimensionsSchema>;
export type Country = (typeof COUNTRIES)[number];
export type ItemType = (typeof ITEM_TYPES)[number];
export type CarrierSlug = (typeof CARRIERS)[number];
