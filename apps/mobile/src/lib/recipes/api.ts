/**
 * CRUD against the BiteBook Apps Script backend (Google Sheets + Drive) —
 * plain async functions, no React. Query/mutation hooks live in
 * src/hooks/use-recipes.ts. See backend/apps-script/Code.gs for the API.
 */
import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import type { Ingredient, Recipe, RecipeInput } from "./types";

const API_URL = process.env.EXPO_PUBLIC_BITEBOOK_API_URL;
const API_SECRET = process.env.EXPO_PUBLIC_BITEBOOK_API_SECRET;

if (!API_URL || !API_SECRET) {
  throw new Error(
    "Missing API config — copy apps/mobile/.env.example to apps/mobile/.env",
  );
}

/** API row shape (snake_case). */
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

async function parseResponse(res: Response): Promise<unknown> {
  if (!res.ok) throw new Error(`API request failed (${res.status})`);
  const data = await res.json();
  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String((data as { error: unknown }).error));
  }
  return data;
}

async function apiGet(params: Record<string, string>): Promise<unknown> {
  const query = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  return parseResponse(await fetch(`${API_URL}?${query}`));
}

/** Content-Type stays text/plain: Apps Script cannot answer CORS preflights. */
async function apiPost(body: Record<string, unknown>): Promise<unknown> {
  return parseResponse(
    await fetch(API_URL!, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ secret: API_SECRET, ...body }),
    }),
  );
}

/**
 * Turns the form's image value into API fields. Newly picked photos are local
 * file URIs: resize + compress, then send as base64 for Drive upload. Remote
 * URLs pass through, so saving without touching the photo never re-uploads.
 */
async function imageFields(imageUrl: string | null): Promise<{
  image_url?: string | null;
  imageBase64?: string;
  imageContentType?: string;
}> {
  if (!imageUrl || !imageUrl.startsWith("file:")) {
    return { image_url: imageUrl };
  }
  const manipulated = await manipulateAsync(
    imageUrl,
    [{ resize: { width: 1280 } }],
    { compress: 0.8, format: SaveFormat.JPEG },
  );
  const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { imageBase64: base64, imageContentType: "image/jpeg" };
}

async function inputToApi(input: RecipeInput) {
  const { image_url, imageBase64, imageContentType } = await imageFields(
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

export async function getRecipe(id: string): Promise<Recipe | null> {
  const row = (await apiGet({ action: "get", id })) as Row | null;
  return row ? rowToRecipe(row) : null;
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  const row = (await apiPost({
    action: "create",
    ...(await inputToApi(input)),
  })) as Row;
  return rowToRecipe(row);
}

export async function updateRecipe(
  id: string,
  input: RecipeInput,
): Promise<Recipe> {
  const row = (await apiPost({
    action: "update",
    id,
    ...(await inputToApi(input)),
  })) as Row;
  return rowToRecipe(row);
}

export async function deleteRecipes(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await apiPost({ action: "delete", ids });
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
