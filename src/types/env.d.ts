/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Google OAuth Configuration
  readonly VITE_GOOGLE_CLIENT_ID: string;
  
  // Gemini API Configuration
  readonly VITE_GEMINI_API_KEY?: string;
  
  // Server Configuration
  readonly VITE_DEV_SERVER_URL: string;
  readonly VITE_PROD_SERVER_URL?: string;
  
  // Add-in Configuration
  readonly VITE_ADDIN_NAME?: string;
  readonly VITE_ADDIN_VERSION?: string;
  
  // Feature Flags
  readonly VITE_ENABLE_CHAT?: string;
  readonly VITE_ENABLE_FORMATTING?: string;
  readonly VITE_ENABLE_AGENTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
