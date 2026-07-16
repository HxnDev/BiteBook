/** TanStack Query hooks over lib/recipes/api — mirrors apps/web/src/hooks/recipes.ts. */
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createRecipe,
  deleteRecipes,
  duplicateRecipe,
  getRecipe,
  listRecipes,
  updateRecipe,
} from "@/lib/recipes/api";
import type { Recipe, RecipeInput } from "@/lib/recipes/types";

const keys = {
  all: ["recipes"] as const,
  detail: (id: string) => ["recipe", id] as const,
};

export function useRecipes() {
  return useQuery({ queryKey: keys.all, queryFn: listRecipes });
}

export function useRecipe(id: string | undefined) {
  return useQuery({
    queryKey: keys.detail(id ?? ""),
    queryFn: () => getRecipe(id!),
    enabled: Boolean(id),
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecipeInput) => createRecipe(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RecipeInput }) =>
      updateRecipe(id, input),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: keys.all });
      void qc.invalidateQueries({ queryKey: keys.detail(r.id) });
    },
  });
}

export function useDeleteRecipes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteRecipes(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDuplicateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recipe: Recipe) => duplicateRecipe(recipe),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
