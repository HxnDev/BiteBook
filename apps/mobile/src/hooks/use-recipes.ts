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
  patchRecipe,
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

/**
 * Patch with optimistic updates: favourite toggles and "cooked" bumps reflect
 * in the UI instantly and roll back if the request fails.
 */
export function usePatchRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Recipe> }) =>
      patchRecipe(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: keys.all });
      await qc.cancelQueries({ queryKey: keys.detail(id) });

      const prevList = qc.getQueryData<Recipe[]>(keys.all);
      const prevDetail = qc.getQueryData<Recipe | null>(keys.detail(id));

      if (prevList) {
        qc.setQueryData<Recipe[]>(
          keys.all,
          prevList.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        );
      }
      if (prevDetail) {
        qc.setQueryData<Recipe>(keys.detail(id), { ...prevDetail, ...patch });
      }
      return { prevList, prevDetail };
    },
    onError: (_err, { id }, ctx) => {
      if (ctx?.prevList) qc.setQueryData(keys.all, ctx.prevList);
      if (ctx?.prevDetail) qc.setQueryData(keys.detail(id), ctx.prevDetail);
    },
    onSettled: (_data, _err, { id }) => {
      void qc.invalidateQueries({ queryKey: keys.all });
      void qc.invalidateQueries({ queryKey: keys.detail(id) });
    },
  });
}
