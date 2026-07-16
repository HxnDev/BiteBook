import * as local from "./store";
import * as remote from "./sheetsStore";

/**
 * Single entry point for recipe data. Uses the Apps Script backend when
 * configured (env vars present), otherwise falls back to the local
 * IndexedDB store.
 */
const impl = remote.isApiConfigured ? remote : local;

export const listRecipes = impl.listRecipes;
export const getRecipe = impl.getRecipe;
export const createRecipe = impl.createRecipe;
export const updateRecipe = impl.updateRecipe;
export const deleteRecipe = impl.deleteRecipe;
export const deleteRecipes = impl.deleteRecipes;
export const duplicateRecipe = impl.duplicateRecipe;
export const patchRecipe = impl.patchRecipe;
