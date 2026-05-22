import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { queryKeys } from "@/services/queryClient";
import type {
  ActivityEntry,
  BusinessInsights,
  DashboardSummary,
  ExpenseBreakdownItem,
} from "./types";

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: async () => (await api.get<DashboardSummary>("/dashboard/summary")).data,
  });
}

export function useExpenseBreakdown() {
  return useQuery({
    queryKey: queryKeys.dashboard.breakdown,
    queryFn: async () =>
      (await api.get<ExpenseBreakdownItem[]>("/dashboard/expense-breakdown")).data,
  });
}

export function useBusinessInsights() {
  return useQuery({
    queryKey: queryKeys.dashboard.insights,
    queryFn: async () => (await api.get<BusinessInsights>("/dashboard/insights")).data,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: queryKeys.dashboard.activity,
    queryFn: async () => (await api.get<ActivityEntry[]>("/dashboard/recent-activity")).data,
  });
}
