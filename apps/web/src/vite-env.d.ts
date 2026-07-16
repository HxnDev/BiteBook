/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BITEBOOK_API_URL?: string;
  readonly VITE_BITEBOOK_API_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
