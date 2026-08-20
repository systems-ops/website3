import { z } from "zod";

export const readingInputSchema = z.object({
  logUnitId: z.string(),
  slotIndex: z.number().int().min(0),
  value: z.number(),
  correctiveAction: z.string().trim().min(1).optional(),
});

export const itemCheckInputSchema = z.object({
  logItemId: z.string(),
  checked: z.boolean(),
});

export const calibrationRowInputSchema = z.object({
  testTermId: z.string().trim().min(1),
  referenceReading: z.number(),
  testReading: z.number(),
  comments: z.string().trim().min(1).optional(),
});

export const receivingLineInputSchema = z.object({
  productName: z.string().trim().min(1),
  productId: z.string().trim().min(1).optional(),
  productCount: z.string().trim().min(1).optional(),
  lotNumber: z.string().trim().min(1).optional(),
  allergenProduct: z.boolean(),
  labeledOrganic: z.boolean(),
  storageType: z.enum(["dry", "refrig", "freezer"]),
});

function explainWhenNo() {
  return z
    .object({ approved: z.boolean(), explain: z.string().trim().min(1).optional() })
    .refine((v) => v.approved || !!v.explain, { message: "Explain why not, before submitting" });
}

export const receivingInputSchema = z.object({
  invoiceNumber: z.string().trim().min(1),
  distributorName: z.string().trim().min(1),
  wfcfo: explainWhenNo(),
  nonGmo: explainWhenNo(),
  truckCondition: explainWhenNo(),
  truckTempCompliant: z.boolean(),
  truckTempF: z.number().optional(),
  palletConditionGood: z.boolean(),
  plasticWrapGood: z.boolean(),
  productsToStandard: explainWhenNo(),
  labelsCurrent: explainWhenNo(),
  lines: z.array(receivingLineInputSchema).min(1),
});

export const createLogEntrySchema = z.object({
  locationId: z.string(),
  logDefinitionId: z.string(),
  businessDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD"),
  readings: z.array(readingInputSchema).optional(),
  itemChecks: z.array(itemCheckInputSchema).optional(),
  calibrationRows: z.array(calibrationRowInputSchema).optional(),
  receiving: receivingInputSchema.optional(),
});

export const receivingReviewInputSchema = z.object({
  totalCount: z.number().int().optional(),
  countTested: z.number().int().optional(),
  standardsReviewed: z.string().trim().min(1).optional(),
  coaReference: z.string().trim().min(1).optional(),
  approved: z.boolean(),
  rejectedReason: z.string().trim().min(1).optional(),
  storageLocation: z.string().trim().min(1).optional(),
  storageCcps: z.string().trim().min(1).optional(),
  comments: z.string().trim().min(1).optional(),
  releasedForUse: z.boolean(),
});

export type CreateLogEntryInput = z.infer<typeof createLogEntrySchema>;

export const amendLogEntrySchema = createLogEntrySchema.omit({
  locationId: true,
  logDefinitionId: true,
  businessDate: true,
});
