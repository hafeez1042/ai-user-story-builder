/**
 * Application configuration using environment variables
 * 
 * Note: All frontend environment variables must be prefixed with VITE_
 * to be accessible in the browser via import.meta.env
 */

interface AppConfig {
  api: {
    url: string;
    timeout: number;
  };
  socket: {
    url: string;
  };
  app: {
    name: string;
    defaultTheme: 'light' | 'dark';
  };
  features: {
    azureIntegration: boolean;
    localStorage: boolean;
  };
  debug: boolean;
}

// Configuration values from environment variables with defaults
const config: AppConfig = {
  api: {
    url: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },
  socket: {
    url: import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Story Builder',
    defaultTheme: (import.meta.env.VITE_DEFAULT_THEME || 'light') as 'light' | 'dark',
  },
  features: {
    azureIntegration: import.meta.env.VITE_ENABLE_AZURE_INTEGRATION !== 'false',
    localStorage: import.meta.env.VITE_ENABLE_LOCAL_STORAGE !== 'false',
  },
  debug: import.meta.env.VITE_DEBUG_MODE === 'true',
};

export default config;
