import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  categories: {
    list: ["categories"] as const,
  },
  sales: {
    list: (params?: { from?: string; to?: string }) => ["sales", params ?? {}] as const,
  },
  expenses: {
    list: (params?: { categoryId?: number; from?: string; to?: string }) =>
      ["expenses", params ?? {}] as const,
  },
  investments: {
    list: (params?: { from?: string; to?: string }) => ["investments", params ?? {}] as const,
  },
  settings: {
    get: ["settings"] as const,
  },
  dashboard: {
    summary: ["dashboard", "summary"] as const,
    breakdown: ["dashboard", "breakdown"] as const,
    insights: ["dashboard", "insights"] as const,
    activity: ["dashboard", "activity"] as const,
  },
  reports: {
    period: (period: "daily" | "monthly" | "yearly") => ["reports", "period", period] as const,
  },
};

export function invalidateLedger() {
  queryClient.invalidateQueries({ queryKey: ["sales"] });
  queryClient.invalidateQueries({ queryKey: ["expenses"] });
  queryClient.invalidateQueries({ queryKey: ["investments"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["reports"] });
}
