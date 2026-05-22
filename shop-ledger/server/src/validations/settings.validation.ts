import { z } from "zod";

export const updateSettingsSchema = z.object({
  shopName: z.string().min(1).max(120).optional(),
  currency: z.string().min(1).max(8).optional(),
  currencySymbol: z.string().min(1).max(8).optional(),
});

export const periodReportQuerySchema = z.object({
  period: z.enum(["daily", "monthly", "yearly"]).default("daily"),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const breakdownQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type PeriodReportQuery = z.infer<typeof periodReportQuerySchema>;
