export const CATEGORIES = [
  "Desi",
  "High Protein",
  "Low Calorie",
  "Meal Prep",
  "Quick",
  "Dessert",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "tbsp",
  "tsp",
  "cup",
  "piece",
  "clove",
  "slice",
  "pinch",
  "can",
  "packet",
  "to taste",
] as const;

export type Unit = (typeof UNITS)[number];

export interface Ingredient {
  id: string;
  name: string;
  /** Display quantity, e.g. 2 (onions) or 500 (g). Optional. */
  quantity: number | null;
  unit: Unit;
  notes: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  /** Compressed data URL (freshly picked) or remote URL (Google Drive). */
  imageUrl: string | null;
  ingredients: Ingredient[];
  instructions: string[];
  notes: string;
  // Manual macros, per 100g. Any may be null.
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  isFavorite: boolean;
  /** Optional cook log — incremented from the detail page. */
  timesCooked: number;
  lastCookedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Shape used when creating/editing (no id/timestamps). */
export type RecipeInput = Omit<
  Recipe,
  "id" | "createdAt" | "updatedAt" | "timesCooked" | "lastCookedAt"
> & {
  timesCooked?: number;
  lastCookedAt?: string | null;
};
