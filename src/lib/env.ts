import { z } from 'zod';

/**
 * Environment variables schema
 * Validates required environment variables at runtime
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().optional(),
  VITE_WS_URL: z.string().optional(),
  MODE: z.enum(['development', 'production', 'test']),
  DEV: z.boolean(),
  PROD: z.boolean(),
});

/**
 * Validate environment variables
 * Throws error if validation fails
 */
export function validateEnv() {
  try {
    const rawEnv = {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_WS_URL: import.meta.env.VITE_WS_URL,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    };

    // Convert to string if it's an array (Vite bug workaround)
    const env = {
      ...rawEnv,
      VITE_API_BASE_URL: Array.isArray(rawEnv.VITE_API_BASE_URL) 
        ? rawEnv.VITE_API_BASE_URL[0] 
        : rawEnv.VITE_API_BASE_URL,
      VITE_WS_URL: Array.isArray(rawEnv.VITE_WS_URL)
        ? rawEnv.VITE_WS_URL[0]
        : rawEnv.VITE_WS_URL,
    };

    const result = envSchema.safeParse(env);

    if (!result.success) {
      console.error('❌ Environment validation failed:');
      console.error(result.error.format());
      console.warn('⚠️ Using default values');
      // Don't throw, just warn and use defaults
    } else {
      console.log('✅ Environment validation passed');
    }

    return result.success ? result.data : null;
  } catch (error) {
    console.error('❌ Environment validation error:', error);
    console.warn('⚠️ Using default values');
    return null;
  }
}

/**
 * Get validated environment variables
 * Always returns valid values with fallbacks
 */
export function getEnv() {
  const rawApiUrl = import.meta.env.VITE_API_BASE_URL;
  const rawWsUrl = import.meta.env.VITE_WS_URL;

  // Handle array values (Vite bug)
  const isDev = import.meta.env.DEV;
  
  const apiBaseUrl = Array.isArray(rawApiUrl) 
    ? rawApiUrl[0] 
    : rawApiUrl || '';
  
  const wsUrl = Array.isArray(rawWsUrl)
    ? rawWsUrl[0]
    : rawWsUrl || '';

  return {
    apiBaseUrl,
    wsUrl,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    mode: import.meta.env.MODE,
  };
}
