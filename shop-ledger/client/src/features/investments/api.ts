import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { invalidateLedger, queryKeys } from "@/services/queryClient";
import type { Investment, InvestmentInput } from "./types";

export function useListInvestments(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: queryKeys.investments.list(params),
    queryFn: async () => (await api.get<Investment[]>("/investments", { params })).data,
  });
}

export function useCreateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: InvestmentInput) =>
      (await api.post<Investment>("/investments", input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["investments"] });
      invalidateLedger();
    },
  });
}

export function useUpdateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: number; input: Partial<InvestmentInput> }) =>
      (await api.patch<Investment>(`/investments/${args.id}`, args.input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["investments"] });
      invalidateLedger();
    },
  });
}

export function useDeleteInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/investments/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["investments"] });
      invalidateLedger();
    },
  });
}
