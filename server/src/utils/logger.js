/**
 * Structured Secure Logger
 * Sanitizes sensitive credentials and provides standard leveled logging.
 */

const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'apiKey', 'api_key', 'service_role'];

function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? JSON.stringify(sanitize(meta)) : '');
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? JSON.stringify(sanitize(meta)) : '');
  },
  error: (message, error = {}) => {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined }
      : error;
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, JSON.stringify(sanitize(errorDetails)));
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? JSON.stringify(sanitize(meta)) : '');
    }
  }
};

