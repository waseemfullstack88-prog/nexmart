import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { env } from '../config/env';
import { ApiError } from '../utils';

export interface ProcessedImageVariant {
  name: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
  width: number;
  height: number;
  filename: string;
  url: string;
  size: number;
}

export interface ImageProcessingResult {
  originalName: string;
  filename: string;
  path: string;
  mimeType: string;
  fileSize: number;
  width: number;
  height: number;
  variants: Record<string, ProcessedImageVariant>;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
}

const VARIANT_SIZES = [
  { name: 'thumbnail', width: 150, height: 150, fit: 'cover' as const },
  { name: 'small', width: 320, height: 320, fit: 'inside' as const },
  { name: 'medium', width: 640, height: 640, fit: 'inside' as const },
  { name: 'large', width: 1280, height: 1280, fit: 'inside' as const },
];

export class ImageProcessor {
  /**
   * Validate and process an uploaded image file into multiple optimized responsive variants.
   */
  static async processImage(
    file: Express.Multer.File,
    options: ImageProcessingOptions = {}
  ): Promise<ImageProcessingResult> {
    const uploadDir = path.resolve(env.uploadDir);
    await fs.mkdir(uploadDir, { recursive: true });

    const quality = options.quality ?? env.imageQuality;
    const maxWidth = options.maxWidth ?? env.maxImageWidth;
    const maxHeight = options.maxHeight ?? env.maxImageHeight;

    // Load file with sharp to get metadata & validate
    let image = sharp(file.path);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height || !metadata.format) {
      throw ApiError.badRequest('Invalid or corrupted image file');
    }

    const isPngWithTransparency = metadata.format === 'png' && metadata.hasAlpha;
    const targetFormat = options.format === 'auto' || !options.format
      ? (isPngWithTransparency ? 'png' : (env.imageOutputFormat as 'webp' | 'jpeg' | 'png'))
      : options.format;

    const baseName = path.parse(file.filename).name;
    const ext = targetFormat === 'png' ? 'png' : targetFormat === 'jpeg' ? 'jpg' : 'webp';

    // 1. Process Master/Original Optimized image (bounded by maxWidth/maxHeight)
    const masterFilename = `${baseName}-original.${ext}`;
    const masterPath = path.join(uploadDir, masterFilename);

    let masterPipeline = sharp(file.path).rotate(); // auto-rotate based on EXIF

    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      masterPipeline = masterPipeline.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    if (targetFormat === 'webp') {
      masterPipeline = masterPipeline.webp({ quality, effort: 4 });
    } else if (targetFormat === 'jpeg') {
      masterPipeline = masterPipeline.jpeg({ quality, progressive: true });
    } else if (targetFormat === 'png') {
      masterPipeline = masterPipeline.png({ quality, compressionLevel: 8 });
    }

    const masterInfo = await masterPipeline.toFile(masterPath);

    // 2. Generate responsive variants (thumbnail, small, medium, large)
    const variants: Record<string, ProcessedImageVariant> = {
      original: {
        name: 'original',
        width: masterInfo.width,
        height: masterInfo.height,
        filename: masterFilename,
        url: `/uploads/${masterFilename}`,
        size: masterInfo.size,
      },
    };

    for (const size of VARIANT_SIZES) {
      // Don't generate variants larger than the master
      if (size.width > masterInfo.width && size.height > masterInfo.height) {
        variants[size.name] = {
          name: size.name as any,
          width: masterInfo.width,
          height: masterInfo.height,
          filename: masterFilename,
          url: `/uploads/${masterFilename}`,
          size: masterInfo.size,
        };
        continue;
      }

      const variantFilename = `${baseName}-${size.name}.${ext}`;
      const variantPath = path.join(uploadDir, variantFilename);

      let variantPipeline = sharp(file.path)
        .rotate()
        .resize(size.width, size.height, {
          fit: size.fit,
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        });

      if (targetFormat === 'webp') {
        variantPipeline = variantPipeline.webp({ quality: Math.min(quality, 85) });
      } else if (targetFormat === 'jpeg') {
        variantPipeline = variantPipeline.jpeg({ quality: Math.min(quality, 85), progressive: true });
      } else if (targetFormat === 'png') {
        variantPipeline = variantPipeline.png({ compressionLevel: 8 });
      }

      const variantInfo = await variantPipeline.toFile(variantPath);

      variants[size.name] = {
        name: size.name as any,
        width: variantInfo.width,
        height: variantInfo.height,
        filename: variantFilename,
        url: `/uploads/${variantFilename}`,
        size: variantInfo.size,
      };
    }

    // Clean up temporary uploaded file if different from original
    if (file.path !== masterPath) {
      try {
        await fs.unlink(file.path);
      } catch (err) {
        // ignore unlink errors
      }
    }

    return {
      originalName: file.originalname,
      filename: masterFilename,
      path: masterPath,
      mimeType: targetFormat === 'png' ? 'image/png' : targetFormat === 'jpeg' ? 'image/jpeg' : 'image/webp',
      fileSize: masterInfo.size,
      width: masterInfo.width,
      height: masterInfo.height,
      variants,
    };
  }

  /**
   * Delete image files (all variants) from disk.
   */
  static async deleteImageFiles(variantsJson: string | null): Promise<void> {
    if (!variantsJson) return;

    try {
      const variants: Record<string, ProcessedImageVariant> = typeof variantsJson === 'string'
        ? JSON.parse(variantsJson)
        : variantsJson;

      const uploadDir = path.resolve(env.uploadDir);
      const deletedFiles = new Set<string>();

      for (const variant of Object.values(variants)) {
        if (variant && variant.filename && !deletedFiles.has(variant.filename)) {
          deletedFiles.add(variant.filename);
          const filePath = path.join(uploadDir, variant.filename);
          try {
            await fs.unlink(filePath);
          } catch {
            // Ignore if file doesn't exist
          }
        }
      }
    } catch (err) {
      console.error('Error deleting image variants:', err);
    }
  }
}
