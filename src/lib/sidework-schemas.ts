import { z } from "zod";

const BUSINESS_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SHIFTS = ["OPENING", "RUNNING", "CLOSING", "DOWNTIME"] as const;

export const createSideworkTaskSchema = z.object({
  title: z.string().trim().min(1),
  category: z.string().trim().min(1),
  role: z.string().trim().min(1),
  shift: z.enum(SHIFTS),
  locationIds: z.array(z.string()).min(1),
  sortOrder: z.number().int().optional(),
});

export const updateSideworkTaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  role: z.string().trim().min(1).optional(),
  shift: z.enum(SHIFTS).optional(),
  locationIds: z.array(z.string()).min(1).optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const sideworkActionSchema = z.object({
  locationId: z.string(),
  businessDate: z.string().regex(BUSINESS_DATE_RE, "expected YYYY-MM-DD"),
});
