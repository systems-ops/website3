import { z } from "zod";

export const createTrainingResourceSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  url: z.string().trim().url(),
  category: z.string().trim().min(1),
  applicableRoles: z.array(z.string().trim().min(1)).optional().default([]),
  applicableLocationIds: z.array(z.string()).optional().default([]),
  sortOrder: z.number().int().optional(),
});

export const updateTrainingResourceSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).nullable().optional(),
  url: z.string().trim().url().optional(),
  category: z.string().trim().min(1).optional(),
  applicableRoles: z.array(z.string().trim().min(1)).optional(),
  applicableLocationIds: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const createTrainingLinkSchema = z.object({
  logDefinitionId: z.string(),
  logItemId: z.string().optional(),
});
