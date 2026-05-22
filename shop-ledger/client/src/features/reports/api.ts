import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { queryKeys } from "@/services/queryClient";
import type { Period, PeriodReport } from "./types";

export function usePeriodReport(period: Period) {
  return useQuery({
    queryKey: queryKeys.reports.period(period),
    queryFn: async () =>
      (await api.get<PeriodReport>("/reports/period", { params: { period } })).data,
  });
}
