import { isSupabaseConfigured } from "@/lib/supabase";
import * as local from "./store";
import * as remote from "./supabaseStore";

/**
 * Single entry point for recipe data. Uses Supabase when configured (env vars
 * present), otherwise falls back to the local IndexedDB store.
 */
const impl = isSupabaseConfigured ? remote : local;

export const listRecipes = impl.listRecipes;
export const getRecipe = impl.getRecipe;
export const createRecipe = impl.createRecipe;
export const updateRecipe = impl.updateRecipe;
export const deleteRecipe = impl.deleteRecipe;
export const deleteRecipes = impl.deleteRecipes;
export const duplicateRecipe = impl.duplicateRecipe;
export const patchRecipe = impl.patchRecipe;
