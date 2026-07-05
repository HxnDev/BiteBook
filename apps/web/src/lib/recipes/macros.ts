import type { Recipe } from "./types";

export interface MacroSet {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

/** Manual macros, stored per 100g. Null if none have been entered. */
export function per100g(r: Recipe): MacroSet | null {
  if (
    r.calories == null &&
    r.protein == null &&
    r.carbs == null &&
    r.fat == null
  ) {
    return null;
  }
  return {
    calories: r.calories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
  };
}

export function fmt(v: number | null, digits = 0): string {
  if (v == null) return "—";
  return v.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}
