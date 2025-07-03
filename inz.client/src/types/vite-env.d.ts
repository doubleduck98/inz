/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly TARGET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
