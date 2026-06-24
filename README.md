# BiteBook

> Your recipes, beautifully kept.

A personal, shared recipe book with photos, flexible ingredients and manual
macros (per 100g) — built to feel as polished as a flagship product. No login:
anyone in the family with the link can read, add and edit. Hosted at
**recipes.hxndev.com**.

## Features

- **Add / edit recipes** — photo upload (client-side compressed), flexible
  ingredient lines (quantity + unit, with an optional grams field), step-by-step
  instructions and free-form notes.
- **Manual macros, per 100g** — enter calories / protein / carbs / fat for the
  whole cooked batch plus the batch weight; macros are shown per 100g.
- **Browse** — search by title/tag/ingredient, filter by category, sort, and an
  optional "group by month" view.
- **Multi-select delete** — select multiple recipes from the grid and delete
  them in one go, without opening each.
- **Landing page** — animated hero plus at-a-glance stats and recent recipes.
- Motion-first UX with a `prefers-reduced-motion` fallback throughout.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS** + custom design system (ember & saffron on espresso)
- **Framer Motion** (UI motion), **GSAP + ScrollTrigger** (scroll narrative),
  **Lenis** (smooth scroll), **React Three Fiber** (GLSL hero)
- **TanStack Query** + **react-hook-form** + **zod**
- **Supabase** (Postgres + Storage) for shared data, with an **IndexedDB**
  fallback for local/offline use
- Deploy: **Vercel**

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run lint
```

Without Supabase env vars the app runs fully local-first against IndexedDB.

## Environment

Copy `.env.example` to `.env` and fill in your Supabase project credentials:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Database setup

Run `supabase/schema.sql` once in the Supabase SQL Editor. It creates the
`recipes` table, the `updated_at` trigger, open (shared, no-login) RLS policies
and the public `recipe-images` storage bucket. It's safe to run more than once.

## Project structure

```
src/
  components/      layout, hero, motion primitives, recipe UI, ui kit
  hooks/           data hooks (TanStack Query), reduced-motion
  lib/
    recipes/       data layer: types, macros, IndexedDB + Supabase stores, api
    motion.ts      Framer Motion presets
    supabase.ts    Supabase client
  pages/           routed pages (Home, Recipes, RecipeDetail, AddRecipe, …)
supabase/
  schema.sql       Postgres schema, RLS and storage setup
```
