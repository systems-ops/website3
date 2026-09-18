import { z } from "zod";

const BUSINESS_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const createProductSchema = z.object({
  locationId: z.string(),
  name: z.string().trim().min(1),
  category: z.string().trim().min(1).optional(),
  shelfLifeDays: z.number().int().positive().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  shelfLifeDays: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const raiseLowStockSchema = z.object({
  locationId: z.string(),
  note: z.string().trim().min(1).optional(),
});

export const clearLowStockSchema = z.object({
  disposition: z.enum(["ordered", "received"]),
});

export const createOpenItemSchema = z.object({
  locationId: z.string(),
  productId: z.string(),
  receivingLineId: z.string().optional(),
  sourceText: z.string().trim().min(1).optional(),
  openedDate: z.string().regex(BUSINESS_DATE_RE, "expected YYYY-MM-DD"),
  /// Required when the product has no shelfLifeDays to compute this from.
  useByDate: z.string().regex(BUSINESS_DATE_RE, "expected YYYY-MM-DD").optional(),
  storageLocation: z.string().trim().min(1).optional(),
});

export const discardOpenItemSchema = z.object({
  reason: z.string().trim().min(1),
});
