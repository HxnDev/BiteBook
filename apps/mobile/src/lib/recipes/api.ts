/**
 * Supabase CRUD for recipes — plain async functions, no React.
 * Query/mutation hooks live in src/hooks/use-recipes.ts.
 * Mirrors apps/web/src/lib/recipes/supabaseStore.ts.
 */
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { supabase } from "@/lib/supabase";
import type { Ingredient, Recipe, RecipeInput } from "./types";

const TABLE = "recipes";
const BUCKET = "recipe-images";

/** DB row shape (snake_case). */
interface Row {
  id: string;
  title: string;
  description: string;
  category: Recipe["category"];
  tags: string[];
  image_url: string | null;
  ingredients: Ingredient[];
  instructions: string[];
  notes: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  is_favorite: boolean;
  times_cooked: number;
  last_cooked_at: string | null;
  created_at: string;
  updated_at: string;
}

function rowToRecipe(r: Row): Recipe {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    category: r.category,
    tags: r.tags ?? [],
    imageUrl: r.image_url,
    ingredients: (r.ingredients ?? []) as Ingredient[],
    instructions: r.instructions ?? [],
    notes: r.notes ?? "",
    calories: r.calories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    isFavorite: r.is_favorite,
    timesCooked: r.times_cooked ?? 0,
    lastCookedAt: r.last_cooked_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function inputToRow(input: RecipeInput, imageUrl: string | null) {
  return {
    title: input.title,
    description: input.description,
    category: input.category,
    tags: input.tags,
    image_url: imageUrl,
    ingredients: input.ingredients,
    instructions: input.instructions,
    notes: input.notes,
    calories: input.calories,
    protein: input.protein,
    carbs: input.carbs,
    fat: input.fat,
    is_favorite: input.isFavorite,
  };
}

/**
 * Resolves a picked local photo (file:// URI) into a public storage URL:
 * resize + compress, then upload. Remote URLs and nulls pass through, so
 * saving a recipe without touching its photo never re-uploads.
 */
async function resolveImage(imageUrl: string | null): Promise<string | null> {
  if (!imageUrl || !imageUrl.startsWith("file:")) return imageUrl;

  const manipulated = await manipulateAsync(
    imageUrl,
    [{ resize: { width: 1280 } }],
    { compress: 0.8, format: SaveFormat.JPEG },
  );
  const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, decode(base64), { contentType: "image/jpeg" });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function listRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(rowToRecipe);
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToRecipe(data as Row) : null;
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  const imageUrl = await resolveImage(input.imageUrl);
  const { data, error } = await supabase
    .from(TABLE)
    .insert(inputToRow(input, imageUrl))
    .select()
    .single();
  if (error) throw error;
  return rowToRecipe(data as Row);
}

export async function updateRecipe(
  id: string,
  input: RecipeInput,
): Promise<Recipe> {
  const imageUrl = await resolveImage(input.imageUrl);
  const { data, error } = await supabase
    .from(TABLE)
    .update(inputToRow(input, imageUrl))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToRecipe(data as Row);
}

export async function deleteRecipes(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from(TABLE).delete().in("id", ids);
  if (error) throw error;
}

export async function duplicateRecipe(recipe: Recipe): Promise<Recipe> {
  return createRecipe({
    ...recipe,
    title: `${recipe.title} (copy)`,
    isFavorite: false,
    timesCooked: 0,
    lastCookedAt: null,
  });
}

export async function patchRecipe(
  id: string,
  patch: Partial<Recipe>,
): Promise<Recipe> {
  const row: Record<string, unknown> = {};
  if ("isFavorite" in patch) row.is_favorite = patch.isFavorite;
  if ("timesCooked" in patch) row.times_cooked = patch.timesCooked;
  if ("lastCookedAt" in patch) row.last_cooked_at = patch.lastCookedAt;

  const { data, error } = await supabase
    .from(TABLE)
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToRecipe(data as Row);
}
