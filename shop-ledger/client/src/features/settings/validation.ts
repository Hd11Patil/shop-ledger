import { z } from "zod";

export const settingsSchema = z.object({
  shopName: z.string().min(1, "Shop name is required").max(120),
  currency: z.string().min(1).max(8),
  currencySymbol: z.string().min(1).max(8),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
