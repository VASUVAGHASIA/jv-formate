/**
 * Environment Configuration Utility
 * Centralizes access to environment variables with validation
 */

export interface EnvConfig {
  googleClientId: string;
  geminiApiKey?: string;
  devServerUrl: string;
  prodServerUrl?: string;
  addinName: string;
  addinVersion: string;
  enableChat: boolean;
  enableFormatting: boolean;
  enableAgents: boolean;
}

/**
 * Get environment variable value
 */
const getEnvVar = (key: string, required: boolean = false): string | undefined => {
  const value = import.meta.env[key as keyof ImportMetaEnv];
  
  if (required && !value) {
    console.error(`Missing required environment variable: ${key}`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value as string | undefined;
};

/**
 * Parse boolean from string
 */
const parseBoolean = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

/**
 * Validate Google Client ID format
 */
const validateGoogleClientId = (clientId: string): boolean => {
  // Basic validation: should end with .apps.googleusercontent.com
  return clientId.endsWith('.apps.googleusercontent.com');
};

/**
 * Get all environment configuration
 */
export const getEnvConfig = (): EnvConfig => {
  const googleClientId = getEnvVar('VITE_GOOGLE_CLIENT_ID', true) || '';
  
  // Validate Google Client ID
  if (googleClientId && !googleClientId.includes('YOUR_GOOGLE_CLIENT_ID') && !validateGoogleClientId(googleClientId)) {
    console.warn('Google Client ID may be invalid. It should end with .apps.googleusercontent.com');
  }
  
  return {
    googleClientId,
    geminiApiKey: getEnvVar('VITE_GEMINI_API_KEY'),
    devServerUrl: getEnvVar('VITE_DEV_SERVER_URL') || 'https://localhost:3000',
    prodServerUrl: getEnvVar('VITE_PROD_SERVER_URL'),
    addinName: getEnvVar('VITE_ADDIN_NAME') || 'JV-ForMate',
    addinVersion: getEnvVar('VITE_ADDIN_VERSION') || '1.0.0',
    enableChat: parseBoolean(getEnvVar('VITE_ENABLE_CHAT'), true),
    enableFormatting: parseBoolean(getEnvVar('VITE_ENABLE_FORMATTING'), true),
    enableAgents: parseBoolean(getEnvVar('VITE_ENABLE_AGENTS'), true),
  };
};

/**
 * Check if environment is properly configured
 */
export const isEnvConfigured = (): boolean => {
  try {
    const config = getEnvConfig();
    return (
      !!config.googleClientId &&
      !config.googleClientId.includes('YOUR_GOOGLE_CLIENT_ID') &&
      validateGoogleClientId(config.googleClientId)
    );
  } catch {
    return false;
  }
};

/**
 * Get environment-specific warnings
 */
export const getEnvWarnings = (): string[] => {
  const warnings: string[] = [];
  const config = getEnvConfig();
  
  if (!config.googleClientId) {
    warnings.push('Google Client ID is not set');
  } else if (config.googleClientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
    warnings.push('Google Client ID needs to be replaced with actual credentials');
  } else if (!validateGoogleClientId(config.googleClientId)) {
    warnings.push('Google Client ID format appears invalid');
  }
  
  if (!config.geminiApiKey) {
    warnings.push('Gemini API Key is not set (optional if using OAuth)');
  }
  
  return warnings;
};

/**
 * Log environment configuration status (for development)
 */
export const logEnvStatus = (): void => {
  if (import.meta.env.DEV) {
    const config = getEnvConfig();
    const warnings = getEnvWarnings();
    
    console.group('🔧 Environment Configuration');
    console.log('Add-in Name:', config.addinName);
    console.log('Version:', config.addinVersion);
    console.log('Server URL:', config.devServerUrl);
    console.log('Google Client ID configured:', !!config.googleClientId && !config.googleClientId.includes('YOUR_GOOGLE_CLIENT_ID'));
    console.log('Gemini API Key configured:', !!config.geminiApiKey);
    console.log('Features:', {
      chat: config.enableChat,
      formatting: config.enableFormatting,
      agents: config.enableAgents,
    });
    
    if (warnings.length > 0) {
      console.warn('⚠️ Warnings:', warnings);
    } else {
      console.log('✅ All required environment variables are configured');
    }
    
    console.groupEnd();
  }
};

// Export singleton instance
export const env = getEnvConfig();

// Log status on module load (development only)
if (import.meta.env.DEV) {
  logEnvStatus();
}
