import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { queryKeys } from "@/services/queryClient";
import type { AppSettings } from "./types";
import type { SettingsInput } from "./validation";

export function useGetSettings() {
  return useQuery({
    queryKey: queryKeys.settings.get,
    queryFn: async () => (await api.get<AppSettings>("/settings")).data,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<SettingsInput>) =>
      (await api.patch<AppSettings>("/settings", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.settings.get }),
  });
}
