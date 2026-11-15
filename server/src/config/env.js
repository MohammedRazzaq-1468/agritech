import { z } from 'zod';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((v) => parseInt(v, 10)).default('5000'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  API_BASE_URL: z.string().default('http://localhost:5000/api/v1'),
  
  // Supabase
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL").optional().or(z.literal('')),
  SUPABASE_ANON_KEY: z.string().optional().or(z.literal('')),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().or(z.literal('')),
  SUPABASE_STORAGE_BUCKET: z.string().default('crop-diagnostics'),

  // Google Gemini AI
  GEMINI_API_KEY: z.string().optional().or(z.literal('')),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),

  // Weather API
  WEATHER_API_PROVIDER: z.string().default('open-meteo'),
  WEATHER_API_KEY: z.string().optional().or(z.literal('')),
  WEATHER_API_BASE_URL: z.string().default('https://api.open-meteo.com/v1'),

  // Security / Limits
  RATE_LIMIT_WINDOW_MS: z.string().transform((v) => parseInt(v, 10)).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((v) => parseInt(v, 10)).default('100'),
  MAX_IMAGE_SIZE_MB: z.string().transform((v) => parseInt(v, 10)).default('10')
});

let parsedEnv;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (err) {
  logger.error("Environment configuration validation failed", err);
  process.exit(1);
}

// Log status of external services without leaking keys
if (!parsedEnv.GEMINI_API_KEY) {
  logger.warn("GEMINI_API_KEY is not configured in environment. AI features will require API key setup.");
}
if (!parsedEnv.SUPABASE_URL || (!parsedEnv.SUPABASE_ANON_KEY && !parsedEnv.SUPABASE_SERVICE_ROLE_KEY)) {
  logger.warn("Supabase credentials not fully configured. Database & auth will operate in simulated dev mode.");
}

export const env = parsedEnv;

