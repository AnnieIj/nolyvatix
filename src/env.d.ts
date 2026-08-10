/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_STELLAR_NETWORK: string;
  readonly VITE_HORIZON_URL: string;
  readonly VITE_SOROBAN_RPC_URL: string;
  readonly GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
