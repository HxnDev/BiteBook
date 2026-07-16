import type { Ingredient, Recipe, RecipeInput } from "./types";

/**
 * Recipe store backed by the BiteBook Apps Script web app
 * (Google Sheets for data, Google Drive for photos).
 * See backend/apps-script/Code.gs for the API contract.
 */

const API_URL = import.meta.env.VITE_BITEBOOK_API_URL as string | undefined;
const API_SECRET = import.meta.env.VITE_BITEBOOK_API_SECRET as
  | string
  | undefined;

export const isApiConfigured = Boolean(API_URL && API_SECRET);

/** API row shape (snake_case) — same as the old Supabase rows. */
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

async function apiGet(params: Record<string, string>): Promise<unknown> {
  const res = await fetch(`${API_URL}?${new URLSearchParams(params)}`);
  if (!res.ok) throw new Error(`API request failed (${res.status})`);
  const data = await res.json();
  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String((data as { error: unknown }).error));
  }
  return data;
}

/**
 * Writes go through POST. Content-Type must stay text/plain: Apps Script
 * cannot answer CORS preflights, and text/plain requests skip them.
 */
async function apiPost(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(API_URL!, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ secret: API_SECRET, ...body }),
  });
  if (!res.ok) throw new Error(`API request failed (${res.status})`);
  const data = await res.json();
  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String((data as { error: unknown }).error));
  }
  return data;
}

/**
 * Splits the form's image value into API fields. Newly picked photos arrive
 * as compressed data URLs and are sent as base64 for Drive upload; existing
 * remote URLs pass through untouched.
 */
function imageFields(imageUrl: string | null): {
  image_url?: string | null;
  imageBase64?: string;
  imageContentType?: string;
} {
  if (!imageUrl || !imageUrl.startsWith("data:")) {
    return { image_url: imageUrl };
  }
  const [meta, base64] = imageUrl.split(",");
  const contentType = meta.slice(5, meta.indexOf(";")) || "image/jpeg";
  return { imageBase64: base64, imageContentType: contentType };
}

function inputToApi(input: RecipeInput) {
  const { image_url, imageBase64, imageContentType } = imageFields(
    input.imageUrl,
  );
  return {
    input: {
      title: input.title,
      description: input.description,
      category: input.category,
      tags: input.tags,
      image_url,
      ingredients: input.ingredients,
      instructions: input.instructions,
      notes: input.notes,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
      is_favorite: input.isFavorite,
    },
    imageBase64,
    imageContentType,
  };
}

export async function listRecipes(): Promise<Recipe[]> {
  const rows = (await apiGet({ action: "list" })) as Row[];
  return rows.map(rowToRecipe);
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const row = (await apiGet({ action: "get", id })) as Row | null;
  return row ? rowToRecipe(row) : undefined;
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  const row = (await apiPost({ action: "create", ...inputToApi(input) })) as Row;
  return rowToRecipe(row);
}

export async function updateRecipe(
  id: string,
  input: RecipeInput,
): Promise<Recipe> {
  const row = (await apiPost({
    action: "update",
    id,
    ...inputToApi(input),
  })) as Row;
  return rowToRecipe(row);
}

export async function deleteRecipe(id: string): Promise<void> {
  await apiPost({ action: "delete", ids: [id] });
}

export async function deleteRecipes(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await apiPost({ action: "delete", ids });
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
