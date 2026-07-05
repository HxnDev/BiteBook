import { supabase } from "@/lib/supabase";
import type { Ingredient, Recipe, RecipeInput } from "./types";

const TABLE = "recipes";
const BUCKET = "recipe-images";

function client() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

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

/** Uploads a data-URL image to storage and returns its public URL. Pass-through
 * for existing remote URLs and nulls. */
async function resolveImage(imageUrl: string | null): Promise<string | null> {
  if (!imageUrl || !imageUrl.startsWith("data:")) return imageUrl;
  const blob = await (await fetch(imageUrl)).blob();
  const path = `${crypto.randomUUID()}.jpg`;
  const { error } = await client()
    .storage.from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  return client().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function listRecipes(): Promise<Recipe[]> {
  const { data, error } = await client()
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(rowToRecipe);
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const { data, error } = await client()
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToRecipe(data as Row) : undefined;
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  const imageUrl = await resolveImage(input.imageUrl);
  const { data, error } = await client()
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
  const { data, error } = await client()
    .from(TABLE)
    .update(inputToRow(input, imageUrl))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToRecipe(data as Row);
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await client().from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function deleteRecipes(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await client().from(TABLE).delete().in("id", ids);
  if (error) throw error;
}

export async function duplicateRecipe(id: string): Promise<Recipe> {
  const existing = await getRecipe(id);
  if (!existing) throw new Error("Recipe not found");
  return createRecipe({
    ...existing,
    title: `${existing.title} (copy)`,
    isFavorite: false,
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
  if ("title" in patch) row.title = patch.title;

  const { data, error } = await client()
    .from(TABLE)
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToRecipe(data as Row);
}
