# BiteBook

> Your recipes, beautifully kept.

A personal, shared family recipe book with photos, flexible ingredients and
manual macros (per 100g). No login: anyone in the family with the link can
read, add and edit. Web app at **bitebook.hxndev.com**, plus an Android app
with full feature parity.

## Apps

This is a pnpm monorepo:

| App | Path | Stack |
|---|---|---|
| Web | `apps/web` | Vite, React 18, Tailwind, Framer Motion, GSAP, R3F |
| Mobile | `apps/mobile` | Expo (SDK 56), Expo Router, Reanimated |

Both share the same design language (ember & saffron on espresso) and the
same backend.

## Backend: Google Sheets + Drive

There is no database server. A **Google Apps Script web app**
(`backend/apps-script/Code.gs`) exposes a small JSON API that stores:

- recipe data in a **Google Sheet** ("BiteBook Data")
- photos in a **Google Drive** folder (`BiteBook/Images`), served via
  Google's image CDN

The script is deployed as "execute as me / accessible to anyone", so the
family needs no accounts. Reads are open; writes require a shared secret
baked into the apps. The web app falls back to a local IndexedDB store when
no API env vars are configured.

## Getting started

```bash
pnpm install
pnpm dev        # web app on http://localhost:5173
pnpm mobile     # Expo dev server for the Android app
pnpm typecheck  # both apps
pnpm lint       # both apps
```

## Environment

Copy `.env.example` to `.env` in `apps/web` and `apps/mobile` and fill in the
Apps Script deployment URL and API secret:

```
# apps/web/.env
VITE_BITEBOOK_API_URL=…/exec
VITE_BITEBOOK_API_SECRET=…

# apps/mobile/.env
EXPO_PUBLIC_BITEBOOK_API_URL=…/exec
EXPO_PUBLIC_BITEBOOK_API_SECRET=…
```

## Backend setup (one time)

1. Create a new project at script.google.com and paste in
   `backend/apps-script/Code.gs`.
2. Set `API_SECRET` to a long random string (`openssl rand -hex 24`).
3. Run the `setup` function once to create the spreadsheet and Drive folders.
4. Deploy → Web app → Execute as: Me, Who has access: Anyone. Use the `/exec`
   URL in the env files above.

## Deployment

- **Web**: Vercel, configured by the root `vercel.json` (builds `apps/web`,
  SPA rewrites). Set the two `VITE_*` env vars in the Vercel project.
- **Mobile**: EAS builds (`apps/mobile/eas.json`). JS-only changes ship
  over-the-air: pushing to `main` triggers `.github/workflows/eas-update.yml`,
  which publishes an EAS Update to installed apps. Only native changes
  (SDK upgrades, new native modules, version bumps) need a new APK:
  `npx eas-cli build --profile preview --platform android`.

## Project structure

```
apps/
  web/src/
    components/      layout, hero, motion primitives, recipe UI, ui kit
    hooks/           data hooks (TanStack Query), reduced-motion
    lib/recipes/     types, macros, IndexedDB + Apps Script stores, api
    pages/           routed pages (Home, Recipes, RecipeDetail, AddRecipe, …)
  mobile/src/
    app/             Expo Router routes (tabs, recipe/[id], edit/[id])
    components/      recipe UI + themed ui kit
    hooks/           TanStack Query hooks
    lib/             theme, recipes api + types
backend/
  apps-script/       the Google Apps Script backend (deployed manually)
scripts/
  export-supabase.mjs        one-time migration (legacy, kept for reference)
  import-to-apps-script.mjs  pushes a local export into the backend
```
