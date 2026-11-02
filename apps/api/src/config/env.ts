import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.API_PORT || '4000', 10),
  apiHost: process.env.API_HOST || 'http://localhost:4000',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Frontend URLs
  adminUrl: process.env.ADMIN_URL || 'http://localhost:3001',
  storefrontUrl: process.env.STOREFRONT_URL || 'http://localhost:3000',
  platformAdminUrl: process.env.PLATFORM_ADMIN_URL || 'http://localhost:3002',

  // File Upload
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSizeKb: parseInt(process.env.MAX_FILE_SIZE_KB || '4096', 10),
  maxImageWidth: parseInt(process.env.MAX_IMAGE_WIDTH || '2048', 10),
  maxImageHeight: parseInt(process.env.MAX_IMAGE_HEIGHT || '2048', 10),
  imageQuality: parseInt(process.env.IMAGE_QUALITY || '80', 10),
  imageOutputFormat: process.env.IMAGE_OUTPUT_FORMAT || 'webp',

  // Super Admin
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL || 'admin@nexmart.com',
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || 'NexMart@Admin123',

  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};
