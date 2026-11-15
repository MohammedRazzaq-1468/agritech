import multer from 'multer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// File filter based on client MIME type
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported image format: ${file.mimetype}. Allowed: JPG, PNG, WEBP`), false);
  }
};

const maxSizeBytes = (env.MAX_IMAGE_SIZE_MB || 10) * 1024 * 1024;

export const upload = multer({
  storage,
  limits: {
    fileSize: maxSizeBytes,
    files: 1
  },
  fileFilter
});

/**
 * Validates actual binary buffer magic bytes to prevent disguised executables
 */
export function validateImageMagicBytes(req, res, next) {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({
      success: false,
      message: 'No image uploaded. Please provide a plant leaf photograph.',
      data: null,
      error: { code: 'FILE_MISSING', details: ['Image file required under field "image"'] }
    });
  }

  const buffer = req.file.buffer;
  if (buffer.length < 4) {
    return res.status(400).json({
      success: false,
      message: 'Uploaded file is corrupted or too small.',
      data: null,
      error: { code: 'INVALID_FILE_CONTENT', details: ['Buffer length under minimum header size'] }
    });
  }

  // Check magic bytes
  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  const isWebp = buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP';

  if (!isJpeg && !isPng && !isWebp) {
    logger.warn('Magic byte validation failed for uploaded file', {
      mimetype: req.file.mimetype,
      originalName: req.file.originalname
    });
    return res.status(400).json({
      success: false,
      message: 'Invalid file signature. Uploaded file is not a valid JPEG, PNG, or WEBP image.',
      data: null,
      error: { code: 'INVALID_MAGIC_BYTES', details: ['File header does not match expected image signatures'] }
    });
  }

  next();
}

