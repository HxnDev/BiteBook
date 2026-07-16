import { idbDelete, idbGet, idbGetAll, idbPut } from "./idb";
import type { Recipe, RecipeInput } from "./types";

/**
 * Local-first recipe store backed by IndexedDB. The async signatures mirror the
 * remote (Apps Script) implementation, so the two are a drop-in swap.
 */

function fromInput(input: RecipeInput): Recipe {
  const now = new Date().toISOString();
  return {
    ...input,
    id: crypto.randomUUID(),
    timesCooked: input.timesCooked ?? 0,
    lastCookedAt: input.lastCookedAt ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function listRecipes(): Promise<Recipe[]> {
  const all = await idbGetAll<Recipe>();
  return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  return idbGet<Recipe>(id);
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  const recipe = fromInput(input);
  await idbPut(recipe);
  return recipe;
}

export async function updateRecipe(
  id: string,
  input: RecipeInput,
): Promise<Recipe> {
  const existing = await idbGet<Recipe>(id);
  if (!existing) throw new Error("Recipe not found");
  const updated: Recipe = {
    ...existing,
    ...input,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  await idbPut(updated);
  return updated;
}

export async function deleteRecipe(id: string): Promise<void> {
  await idbDelete(id);
}

export async function deleteRecipes(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => idbDelete(id)));
}

export async function duplicateRecipe(id: string): Promise<Recipe> {
  const existing = await idbGet<Recipe>(id);
  if (!existing) throw new Error("Recipe not found");
  const copy = fromInput({
    ...existing,
    title: `${existing.title} (copy)`,
    isFavorite: false,
  });
  await idbPut(copy);
  return copy;
}

