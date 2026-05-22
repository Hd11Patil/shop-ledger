import { z } from "zod";

export const investmentSchema = z.object({
  amount: z.coerce.number().nonnegative("Amount must be 0 or more"),
  note: z.string().max(500).optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
});

export type InvestmentInput = z.infer<typeof investmentSchema>;
