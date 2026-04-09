import { z } from "zod";
import { CARRIERS, COUNTRIES, ITEM_TYPES, DimensionsSchema } from "./rate-request.schema.js";

export const BookingCreateSchema = z.object({
  carrierId: z.enum(CARRIERS),
  originCountry: z.enum(COUNTRIES),
  destinationCountry: z.enum(COUNTRIES),
  actualWeightKg: z.number().positive().max(3000, "Total weight cannot exceed 3,000 kg (DHL limit)"),
  perPieceWeightKg: z.number().positive().max(1000, "Per-piece weight cannot exceed 1,000 kg (DHL limit)").optional(),
  dims: DimensionsSchema.optional(),
  shipmentType: z.enum(["document", "package"]).default("package"),
  itemTypeId: z.enum(ITEM_TYPES),
  packaging: z.enum(["none", "standard", "premium"]).default("none"),
  insurance: z.boolean().default(false),
  // Sender
  senderName: z.string().min(2).max(100),
  senderMobile: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  senderEmail: z.string().email().optional().or(z.literal("")).or(z.null()),
  pickupPincode: z.string().regex(/^\d{6}$/),
  pickupAddress: z.string().min(5).max(300),
  pickupCity: z.string().max(100).default(""),
  pickupState: z.string().max(100).default(""),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pickupSlot: z.string().min(1),
  // Receiver
  receiverName: z.string().min(2).max(100),
  receiverMobile: z.string().regex(/^\+?\d{7,15}$/),
  receiverEmail: z.string().email().optional().or(z.literal("")).or(z.null()),
  deliveryAddress: z.string().min(5).max(300),
  deliveryCity: z.string().min(1).max(100),
  deliveryState: z.string().min(1).max(100),
  deliveryZip: z.string().min(3).max(20),
  numPieces: z.number().int().positive().max(100).default(1),
  contentsDesc: z.string().max(500).optional(),
  declaredValue: z.number().positive().optional(),
  declaredCurrency: z.string().length(3).default("INR"),
  // Delivery Add-ons
  dhlService: z.enum(["standard", "premium_900", "premium_1200"]).optional(),
  upsOptions: z.object({
    formalClearance: z.boolean().optional(),
    ddp: z.boolean().optional(),
    signature: z.boolean().optional(),
    remoteArea: z.boolean().optional(),
  }).optional(),
});

export type BookingCreate = z.infer<typeof BookingCreateSchema>;
