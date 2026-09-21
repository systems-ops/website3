import { z } from "zod";

export const createReportRecipientSchema = z.object({
  locationId: z.string(),
  email: z.string().trim().email(),
});
