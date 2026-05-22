import { z } from "zod";

export const expenseSchema = z.object({
  amount: z.coerce.number().nonnegative("Amount must be 0 or more"),
  categoryId: z.coerce.number().int().positive("Pick a category"),
  note: z.string().max(500).optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
