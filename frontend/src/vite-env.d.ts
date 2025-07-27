/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_SOCKET_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_DEFAULT_THEME: string;
  readonly VITE_ENABLE_AZURE_INTEGRATION: string;
  readonly VITE_ENABLE_LOCAL_STORAGE: string;
  readonly VITE_DEBUG_MODE: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
