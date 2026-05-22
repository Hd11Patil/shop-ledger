import { z } from "zod";

const dateField = z
  .string()
  .min(1)
  .transform((v) => v.slice(0, 10))
  .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"));

export const createInvestmentSchema = z.object({
  amount: z.coerce.number().nonnegative(),
  note: z.string().max(500).nullable().optional(),
  date: dateField,
});

export const updateInvestmentSchema = createInvestmentSchema.partial();

export const listInvestmentsQuerySchema = z.object({
  from: dateField.optional(),
  to: dateField.optional(),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>;
