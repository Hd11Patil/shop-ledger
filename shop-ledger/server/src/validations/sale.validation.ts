import { z } from "zod";

const dateField = z
  .string()
  .min(1)
  .transform((v) => v.slice(0, 10))
  .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"));

export const createSaleSchema = z.object({
  amount: z.coerce.number().nonnegative(),
  note: z.string().max(500).nullable().optional(),
  date: dateField,
});

export const updateSaleSchema = createSaleSchema.partial();

export const listSalesQuerySchema = z.object({
  from: dateField.optional(),
  to: dateField.optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;
