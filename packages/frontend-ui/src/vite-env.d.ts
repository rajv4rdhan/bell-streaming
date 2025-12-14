/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Allow importing .tsx files without extension
declare module '*.tsx' {
  const content: any;
  export default content;
}
