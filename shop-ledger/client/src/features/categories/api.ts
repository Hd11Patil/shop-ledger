import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { queryKeys } from "@/services/queryClient";
import type { Category, CategoryInput } from "./types";

export function useListCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CategoryInput) => (await api.post<Category>("/categories", input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.list }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: number; input: Partial<CategoryInput> }) =>
      (await api.patch<Category>(`/categories/${args.id}`, args.input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.list }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.list }),
  });
}
