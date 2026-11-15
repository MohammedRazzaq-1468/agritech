import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: env.RATE_LIMIT_MAX_REQUESTS || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
    data: null,
    error: { code: 'RATE_LIMIT_EXCEEDED', details: ['Rate limit threshold triggered'] }
  }
});

// Stricter rate limiter for AI-intensive endpoints (Disease visual diagnosis, Crop recommendations)
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 AI calls per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI advisory rate limit exceeded. Please wait a few moments before requesting more analyses.',
    data: null,
    error: { code: 'AI_RATE_LIMIT_EXCEEDED', details: ['Max 30 AI requests per 15 minutes'] }
  }
});

