import { z } from "zod";

export const batchInputSchema = z.object({
  receivingLineId: z.string(),
});

export const batchOutputSchema = z.object({
  productName: z.string().trim().min(1),
  quantity: z.string().trim().min(1).optional(),
  bakeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD"),
  bestByDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD").optional(),
  disposition: z.enum(["held", "sold_in_store", "shipped"]),
  reference: z.string().trim().min(1).optional(),
});

export const createBatchSchema = z.object({
  locationId: z.string(),
  businessDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD"),
  // Same today-or-yesterday-with-a-reason rule as every other record —
  // see classifySubmissionDate in business-date.ts.
  lateReason: z.string().trim().min(1).optional(),
  batchCode: z.string().trim().min(1),
  productType: z.string().trim().min(1),
  quantity: z.string().trim().min(1).optional(),
  inputs: z.array(batchInputSchema).min(1),
  outputs: z.array(batchOutputSchema).min(1),
});
