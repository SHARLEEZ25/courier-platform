import { z } from "zod";
import { CARRIERS, ITEM_TYPES, DimensionsSchema } from "./rate-request.schema.js";

export const BookingCreateSchema = z.object({
  carrierId: z.enum(CARRIERS),
  originCountry: z.string().min(1),
  destinationCountry: z.string().min(1),
  actualWeightKg: z.number().positive().max(3000, "Total weight cannot exceed 3,000 kg (DHL limit)"),
  perPieceWeightKg: z.number().positive().max(1000, "Per-piece weight cannot exceed 1,000 kg (DHL limit)").optional(),
  dims: DimensionsSchema.optional(),
  shipmentType: z.enum(["document", "package"]).default("package"),
  itemTypeId: z.enum(ITEM_TYPES),
  packaging: z.enum(["none", "standard", "premium"]).default("none"),
  insurance: z.boolean().default(false),
  // Sender (Shipper)
  senderCompany: z.string().min(2).max(100),
  senderMobile: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  senderTelephone: z.string().max(20).default(""),
  senderEmail: z.string().email().optional().or(z.literal("")).or(z.null()),
  senderKyc: z.string().max(50).default(""),
  pickupPincode: z.string().regex(/^\d{6}$/),
  pickupAddress1: z.string().min(5).max(300),
  pickupAddress2: z.string().max(300).default(""),
  pickupCity: z.string().max(100).default(""),
  pickupState: z.string().max(100).default(""),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pickupSlot: z.string().min(1),
  // Receiver (Consignee)
  receiverCompany: z.string().min(2).max(100),
  receiverMobile: z.string().regex(/^\+?\d{7,15}$/),
  receiverTelephone: z.string().max(20).default(""),
  receiverEmail: z.string().email().optional().or(z.literal("")).or(z.null()),
  deliveryAddress1: z.string().min(5).max(300),
  deliveryAddress2: z.string().max(300).default(""),
  deliveryCity: z.string().min(1).max(100),
  deliveryState: z.string().min(1).max(100),
  deliveryZip: z.string().min(3).max(20),
  numPieces: z.number().int().positive().max(100).default(1),
  contentsDesc: z.string().max(500).optional(),
  shipperReference: z.string().max(100).default(""),
  specialInstruction: z.string().max(500).default(""),
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
