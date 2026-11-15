import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err);

  // Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedIssues = err.issues.map(i => `${i.path.join('.')}: ${i.message}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid request data. Please check your form inputs.',
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        details: formattedIssues
      }
    });
  }

  // Multer Upload Errors
  if (err.name === 'MulterError') {
    let message = 'File upload error.';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Image file exceeds the 10 MB maximum allowed size.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field in upload payload.';
    }
    return res.status(400).json({
      success: false,
      message,
      data: null,
      error: { code: err.code || 'UPLOAD_ERROR', details: [err.message] }
    });
  }

  // Custom client errors
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
      error: { code: err.code || 'CLIENT_ERROR', details: err.details || [err.message] }
    });
  }

  // Generic 500 Server Error
  const isDev = process.env.NODE_ENV === 'development';
  return res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred while processing your request.',
    data: null,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      details: isDev ? [err.message, err.stack] : ['Contact support if this problem persists']
    }
  });
}

