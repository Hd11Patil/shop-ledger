import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { invalidateLedger, queryKeys } from "@/services/queryClient";
import type { Expense, ExpenseInput } from "./types";

export function useListExpenses(params?: { categoryId?: number; from?: string; to?: string }) {
  return useQuery({
    queryKey: queryKeys.expenses.list(params),
    queryFn: async () => (await api.get<Expense[]>("/expenses", { params })).data,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ExpenseInput) => (await api.post<Expense>("/expenses", input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      invalidateLedger();
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: number; input: Partial<ExpenseInput> }) =>
      (await api.patch<Expense>(`/expenses/${args.id}`, args.input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      invalidateLedger();
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/expenses/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      invalidateLedger();
    },
  });
}
