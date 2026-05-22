import { z } from "zod";

const dateField = z
  .string()
  .min(1)
  .transform((v) => v.slice(0, 10))
  .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"));

export const createExpenseSchema = z.object({
  amount: z.coerce.number().nonnegative(),
  categoryId: z.coerce.number().int().positive(),
  note: z.string().max(500).nullable().optional(),
  date: dateField,
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const listExpensesQuerySchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  from: dateField.optional(),
  to: dateField.optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
