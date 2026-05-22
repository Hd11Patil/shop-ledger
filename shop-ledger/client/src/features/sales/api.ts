import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { invalidateLedger, queryKeys } from "@/services/queryClient";
import type { Sale, SaleInput } from "./types";

export function useListSales(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: queryKeys.sales.list(params),
    queryFn: async () => (await api.get<Sale[]>("/sales", { params })).data,
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaleInput) => (await api.post<Sale>("/sales", input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      invalidateLedger();
    },
  });
}

export function useUpdateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: number; input: Partial<SaleInput> }) =>
      (await api.patch<Sale>(`/sales/${args.id}`, args.input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      invalidateLedger();
    },
  });
}

export function useDeleteSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/sales/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      invalidateLedger();
    },
  });
}
