import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { ApiError } from '../utils';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

/**
 * Multer storage configuration.
 * Files are saved with UUID filenames to prevent conflicts and path traversal.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(env.uploadDir));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

/**
 * File filter — validates MIME type and extension.
 */
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest(`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(ApiError.badRequest(`Invalid file extension: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }

  cb(null, true);
};

/**
 * Single image upload middleware.
 */
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSizeKb * 1024, // Convert KB to bytes
    files: 1,
  },
}).single('image');

/**
 * Multiple image upload middleware (up to 10 at once).
 */
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSizeKb * 1024,
    files: 10,
  },
}).array('images', 10);

/**
 * Logo/favicon upload middleware.
 */
export const uploadBranding = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2048 * 1024, // 2MB max for logos/favicons
    files: 1,
  },
}).single('file');
