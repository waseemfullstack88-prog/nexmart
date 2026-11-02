import prisma from '../../config/database';
import { ApiError, parsePagination, buildPaginationMeta } from '../../utils';
import { ImageProcessor } from '../../services/imageProcessor';
import { UpdateMediaInput } from './media.validation';

export async function uploadMediaFiles(storeId: string, files: Express.Multer.File[]) {
  if (!files || files.length === 0) {
    throw ApiError.badRequest('No image files provided');
  }

  // Get store image settings if configured
  const storeSettings = await prisma.storeSettings.findUnique({
    where: { storeId },
    select: { imageSettings: true },
  });

  let options = {};
  if (storeSettings?.imageSettings) {
    try {
      const parsed = typeof storeSettings.imageSettings === 'string'
        ? JSON.parse(storeSettings.imageSettings)
        : storeSettings.imageSettings;
      options = {
        maxWidth: parsed.maxWidth,
        maxHeight: parsed.maxHeight,
        quality: parsed.quality,
        format: parsed.format,
      };
    } catch {
      // use defaults
    }
  }

  const uploadedRecords = [];

  for (const file of files) {
    const processed = await ImageProcessor.processImage(file, options);

    const media = await prisma.media.create({
      data: {
        storeId,
        originalName: processed.originalName,
        filename: processed.filename,
        path: `/uploads/${processed.filename}`,
        mimeType: processed.mimeType,
        fileSize: processed.fileSize,
        width: processed.width,
        height: processed.height,
        altText: processed.originalName.replace(/\.[^/.]+$/, ''),
        variants: JSON.stringify(processed.variants),
      },
    });

    uploadedRecords.push({
      ...media,
      variants: processed.variants,
    });
  }

  return uploadedRecords;
}

export async function getStoreMedia(storeId: string, query: Record<string, unknown>) {
  const { page, limit, skip, search, sortBy, sortOrder } = parsePagination(query);

  const where: any = { storeId };
  if (search) {
    where.OR = [
      { originalName: { contains: search } },
      { altText: { contains: search } },
      { filename: { contains: search } },
    ];
  }

  const [total, mediaItems] = await Promise.all([
    prisma.media.count({ where }),
    prisma.media.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            productImages: true,
            variantImages: true,
            categoryImages: true,
          },
        },
      },
    }),
  ]);

  const items = mediaItems.map((item) => ({
    ...item,
    variants: item.variants ? JSON.parse(item.variants as string) : null,
    usageCount: item._count.productImages + item._count.variantImages + item._count.categoryImages,
  }));

  return {
    items,
    meta: buildPaginationMeta(total, page, limit),
  };
}

export async function getMediaById(storeId: string, mediaId: string) {
  const media = await prisma.media.findFirst({
    where: { id: mediaId, storeId },
    include: {
      productImages: {
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
      },
      variantImages: {
        include: {
          variant: { select: { id: true, name: true } },
        },
      },
      categoryImages: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!media) {
    throw ApiError.notFound('Media item not found');
  }

  return {
    ...media,
    variants: media.variants ? JSON.parse(media.variants as string) : null,
  };
}

export async function updateMedia(storeId: string, mediaId: string, data: UpdateMediaInput) {
  const media = await prisma.media.findFirst({
    where: { id: mediaId, storeId },
  });

  if (!media) {
    throw ApiError.notFound('Media item not found');
  }

  const updated = await prisma.media.update({
    where: { id: mediaId },
    data: {
      altText: data.altText !== undefined ? data.altText : media.altText,
      originalName: data.filename !== undefined ? data.filename : media.originalName,
    },
  });

  return {
    ...updated,
    variants: updated.variants ? JSON.parse(updated.variants as string) : null,
  };
}

export async function deleteMedia(storeId: string, mediaId: string, force = false) {
  const media = await prisma.media.findFirst({
    where: { id: mediaId, storeId },
    include: {
      _count: {
        select: {
          productImages: true,
          variantImages: true,
          categoryImages: true,
        },
      },
    },
  });

  if (!media) {
    throw ApiError.notFound('Media item not found');
  }

  const totalUsage = media._count.productImages + media._count.variantImages + media._count.categoryImages;
  if (totalUsage > 0 && !force) {
    throw ApiError.badRequest(
      `This image is currently used by ${totalUsage} product(s) or category(ies). Remove associations first or confirm forced deletion.`
    );
  }

  // Delete physical files from disk
  await ImageProcessor.deleteImageFiles(media.variants);

  // Delete DB record
  await prisma.media.delete({
    where: { id: mediaId },
  });

  return { success: true, message: 'Media item deleted successfully' };
}

export async function bulkDeleteMedia(storeId: string, mediaIds: string[], force = false) {
  const mediaItems = await prisma.media.findMany({
    where: {
      id: { in: mediaIds },
      storeId,
    },
  });

  for (const item of mediaItems) {
    await ImageProcessor.deleteImageFiles(item.variants);
  }

  const result = await prisma.media.deleteMany({
    where: {
      id: { in: mediaIds },
      storeId,
    },
  });

  return { count: result.count };
}
