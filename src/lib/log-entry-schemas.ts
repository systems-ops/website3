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

export const createLogEntrySchema = z.object({
  locationId: z.string(),
  logDefinitionId: z.string(),
  businessDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD"),
  submittedBy: z.string().trim().min(1),
  signatureName: z.string().trim().min(1),
  readings: z.array(readingInputSchema).optional(),
  itemChecks: z.array(itemCheckInputSchema).optional(),
});

export type CreateLogEntryInput = z.infer<typeof createLogEntrySchema>;

export const amendLogEntrySchema = createLogEntrySchema.omit({
  locationId: true,
  logDefinitionId: true,
  businessDate: true,
});
