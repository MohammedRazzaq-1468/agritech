import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let aiInstance = null;

if (env.GEMINI_API_KEY) {
  try {
    aiInstance = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY
    });
    logger.info(`Google GenAI SDK initialized successfully (Model: ${env.GEMINI_MODEL})`);
  } catch (err) {
    logger.error('Failed to initialize Google GenAI SDK', err);
  }
} else {
  logger.warn('Google GenAI SDK not initialized: GEMINI_API_KEY is missing.');
}

export const ai = aiInstance;
export const isGeminiConfigured = () => Boolean(aiInstance);
export const DEFAULT_GEMINI_MODEL = env.GEMINI_MODEL || 'gemini-2.5-flash';

