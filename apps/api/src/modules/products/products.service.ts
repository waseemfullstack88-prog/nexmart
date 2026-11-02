import prisma from '../../config/database';
import { ApiError, generateSlug, parsePagination, buildPaginationMeta } from '../../utils';
import { CreateProductInput, UpdateProductInput, ReorderProductImagesInput } from './products.validation';

export async function getProducts(
  storeId: string,
  query: Record<string, unknown>,
  isPublicStorefront = false
) {
  const { page, limit, skip, search, sortBy, sortOrder } = parsePagination(query);

  const where: any = { storeId };

  // For public storefront, only show published products
  if (isPublicStorefront) {
    where.isPublished = true;
  } else if (query.isPublished !== undefined) {
    where.isPublished = query.isPublished === 'true';
  }

  if (query.isFeatured !== undefined) {
    where.isFeatured = query.isFeatured === 'true';
  }

  if (query.categoryId) {
    where.categoryId = String(query.categoryId);
  }

  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = parseFloat(String(query.minPrice));
    if (query.maxPrice) where.price.lte = parseFloat(String(query.maxPrice));
  }

  if (query.inStock === 'true') {
    where.OR = [
      { trackInventory: false },
      { stockQuantity: { gt: 0 } },
    ];
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
      { description: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          include: {
            media: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          include: {
            images: {
              include: { media: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
  ]);

  const items = products.map((p) => formatProduct(p));

  return {
    items,
    meta: buildPaginationMeta(total, page, limit),
  };
}

export async function getProductByIdOrSlug(
  storeId: string,
  idOrSlug: string,
  isPublicStorefront = false
) {
  const where: any = {
    storeId,
    OR: [{ id: idOrSlug }, { slug: idOrSlug }],
  };

  if (isPublicStorefront) {
    where.isPublished = true;
  }

  const product = await prisma.product.findFirst({
    where,
    include: {
      category: {
        include: {
          parent: { select: { id: true, name: true, slug: true } },
        },
      },
      images: {
        include: { media: true },
        orderBy: { sortOrder: 'asc' },
      },
      variants: {
        include: {
          images: {
            include: { media: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  return formatProduct(product);
}

export async function createProduct(storeId: string, data: CreateProductInput) {
  let slug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);

  // Ensure unique slug per store
  let existing = await prisma.product.findFirst({ where: { storeId, slug } });
  let counter = 1;
  while (existing) {
    slug = `${generateSlug(data.slug || data.name)}-${counter}`;
    existing = await prisma.product.findFirst({ where: { storeId, slug } });
    counter++;
  }

  // Validate category if assigned
  if (data.categoryId) {
    const cat = await prisma.category.findFirst({
      where: { id: data.categoryId, storeId },
    });
    if (!cat) throw ApiError.badRequest('Selected category does not exist');
  }

  const product = await prisma.$transaction(async (tx) => {
    // 1. Create product record
    const newProduct = await tx.product.create({
      data: {
        storeId,
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        specifications: data.specifications ? JSON.stringify(data.specifications) : null,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        costPrice: data.costPrice,
        sku: data.sku,
        barcode: data.barcode,
        isPublished: data.isPublished ?? false,
        isFeatured: data.isFeatured ?? false,
        trackInventory: data.trackInventory ?? true,
        stockQuantity: data.stockQuantity ?? 0,
        lowStockThreshold: data.lowStockThreshold ?? 5,
        categoryId: data.categoryId,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        seo: data.seo ? JSON.stringify(data.seo) : null,
        imageFit: data.imageFit ?? 'AUTO',
        weight: data.weight,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    // 2. Associate product images
    if (data.images && data.images.length > 0) {
      let hasPrimary = data.images.some((img) => img.isPrimary);
      await tx.productImage.createMany({
        data: data.images.map((img, idx) => ({
          productId: newProduct.id,
          mediaId: img.mediaId,
          sortOrder: img.sortOrder ?? idx,
          isPrimary: hasPrimary ? img.isPrimary : idx === 0,
        })),
      });
    }

    // 3. Create variants
    if (data.variants && data.variants.length > 0) {
      for (const [vIdx, v] of data.variants.entries()) {
        const variant = await tx.productVariant.create({
          data: {
            productId: newProduct.id,
            name: v.name,
            attributes: JSON.stringify(v.attributes),
            sku: v.sku,
            price: v.price ?? null,
            stockQuantity: v.stockQuantity ?? 0,
            isAvailable: v.isAvailable ?? true,
            sortOrder: v.sortOrder ?? vIdx,
          },
        });

        if (v.images && v.images.length > 0) {
          await tx.productVariantImage.createMany({
            data: v.images.map((img, iIdx) => ({
              variantId: variant.id,
              mediaId: img.mediaId,
              sortOrder: img.sortOrder ?? iIdx,
            })),
          });
        }
      }
    }

    return newProduct;
  });

  return getProductByIdOrSlug(storeId, product.id);
}

export async function updateProduct(storeId: string, productId: string, data: UpdateProductInput) {
  const existing = await prisma.product.findFirst({
    where: { id: productId, storeId },
  });

  if (!existing) {
    throw ApiError.notFound('Product not found');
  }

  let slug = existing.slug;
  if (data.slug && data.slug !== existing.slug) {
    slug = generateSlug(data.slug);
    const slugCheck = await prisma.product.findFirst({
      where: { storeId, slug, id: { not: productId } },
    });
    if (slugCheck) throw ApiError.conflict('Product slug is already in use');
  }

  if (data.categoryId !== undefined && data.categoryId !== null) {
    const cat = await prisma.category.findFirst({
      where: { id: data.categoryId, storeId },
    });
    if (!cat) throw ApiError.badRequest('Selected category does not exist');
  }

  await prisma.$transaction(async (tx) => {
    // Update main product
    await tx.product.update({
      where: { id: productId },
      data: {
        name: data.name !== undefined ? data.name : existing.name,
        slug,
        description: data.description !== undefined ? data.description : existing.description,
        shortDescription: data.shortDescription !== undefined ? data.shortDescription : existing.shortDescription,
        specifications: data.specifications !== undefined ? JSON.stringify(data.specifications) : existing.specifications,
        price: data.price !== undefined ? data.price : existing.price,
        compareAtPrice: data.compareAtPrice !== undefined ? data.compareAtPrice : existing.compareAtPrice,
        costPrice: data.costPrice !== undefined ? data.costPrice : existing.costPrice,
        sku: data.sku !== undefined ? data.sku : existing.sku,
        barcode: data.barcode !== undefined ? data.barcode : existing.barcode,
        isPublished: data.isPublished !== undefined ? data.isPublished : existing.isPublished,
        isFeatured: data.isFeatured !== undefined ? data.isFeatured : existing.isFeatured,
        trackInventory: data.trackInventory !== undefined ? data.trackInventory : existing.trackInventory,
        stockQuantity: data.stockQuantity !== undefined ? data.stockQuantity : existing.stockQuantity,
        lowStockThreshold: data.lowStockThreshold !== undefined ? data.lowStockThreshold : existing.lowStockThreshold,
        categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId,
        tags: data.tags !== undefined ? JSON.stringify(data.tags) : existing.tags,
        seo: data.seo !== undefined ? JSON.stringify(data.seo) : existing.seo,
        imageFit: data.imageFit !== undefined ? data.imageFit : existing.imageFit,
        weight: data.weight !== undefined ? data.weight : existing.weight,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder,
      },
    });

    // Update images if provided
    if (data.images !== undefined) {
      await tx.productImage.deleteMany({ where: { productId } });

      if (data.images.length > 0) {
        let hasPrimary = data.images.some((img) => img.isPrimary);
        await tx.productImage.createMany({
          data: data.images.map((img, idx) => ({
            productId,
            mediaId: img.mediaId,
            sortOrder: img.sortOrder ?? idx,
            isPrimary: hasPrimary ? img.isPrimary : idx === 0,
          })),
        });
      }
    }

    // Update variants if provided
    if (data.variants !== undefined) {
      await tx.productVariantImage.deleteMany({
        where: { variant: { productId } },
      });
      await tx.productVariant.deleteMany({ where: { productId } });

      for (const [vIdx, v] of data.variants.entries()) {
        const variant = await tx.productVariant.create({
          data: {
            productId,
            name: v.name,
            attributes: JSON.stringify(v.attributes),
            sku: v.sku,
            price: v.price ?? null,
            stockQuantity: v.stockQuantity ?? 0,
            isAvailable: v.isAvailable ?? true,
            sortOrder: v.sortOrder ?? vIdx,
          },
        });

        if (v.images && v.images.length > 0) {
          await tx.productVariantImage.createMany({
            data: v.images.map((img, iIdx) => ({
              variantId: variant.id,
              mediaId: img.mediaId,
              sortOrder: img.sortOrder ?? iIdx,
            })),
          });
        }
      }
    }
  });

  return getProductByIdOrSlug(storeId, productId);
}

export async function duplicateProduct(storeId: string, productId: string) {
  const original = await prisma.product.findFirst({
    where: { id: productId, storeId },
    include: {
      images: true,
      variants: {
        include: { images: true },
      },
    },
  });

  if (!original) {
    throw ApiError.notFound('Product not found');
  }

  const name = `${original.name} (Copy)`;
  let slug = generateSlug(name);
  let existing = await prisma.product.findFirst({ where: { storeId, slug } });
  let counter = 1;
  while (existing) {
    slug = `${generateSlug(name)}-${counter}`;
    existing = await prisma.product.findFirst({ where: { storeId, slug } });
    counter++;
  }

  const duplicated = await prisma.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        storeId,
        name,
        slug,
        description: original.description,
        shortDescription: original.shortDescription,
        specifications: original.specifications,
        price: original.price,
        compareAtPrice: original.compareAtPrice,
        costPrice: original.costPrice,
        sku: original.sku ? `${original.sku}-COPY` : null,
        barcode: null,
        isPublished: false, // Start as unpublished draft
        isFeatured: false,
        trackInventory: original.trackInventory,
        stockQuantity: original.stockQuantity,
        lowStockThreshold: original.lowStockThreshold,
        categoryId: original.categoryId,
        tags: original.tags,
        seo: original.seo,
        imageFit: original.imageFit,
        weight: original.weight,
        sortOrder: original.sortOrder,
      },
    });

    if (original.images.length > 0) {
      await tx.productImage.createMany({
        data: original.images.map((img) => ({
          productId: newProduct.id,
          mediaId: img.mediaId,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        })),
      });
    }

    for (const v of original.variants) {
      const newVariant = await tx.productVariant.create({
        data: {
          productId: newProduct.id,
          name: v.name,
          attributes: v.attributes,
          sku: v.sku ? `${v.sku}-COPY` : null,
          price: v.price,
          stockQuantity: v.stockQuantity,
          isAvailable: v.isAvailable,
          sortOrder: v.sortOrder,
        },
      });

      if (v.images.length > 0) {
        await tx.productVariantImage.createMany({
          data: v.images.map((img) => ({
            variantId: newVariant.id,
            mediaId: img.mediaId,
            sortOrder: img.sortOrder,
          })),
        });
      }
    }

    return newProduct;
  });

  return getProductByIdOrSlug(storeId, duplicated.id);
}

export async function deleteProduct(storeId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId },
  });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  return { success: true, message: 'Product deleted successfully' };
}

export async function reorderProductImages(storeId: string, productId: string, data: ReorderProductImagesInput) {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId },
  });

  if (!product) throw ApiError.notFound('Product not found');

  await prisma.$transaction(
    data.images.map((img) =>
      prisma.productImage.update({
        where: { id: img.id },
        data: {
          sortOrder: img.sortOrder,
          ...(img.isPrimary !== undefined ? { isPrimary: img.isPrimary } : {}),
        },
      })
    )
  );

  return { success: true };
}

function formatProduct(p: any) {
  const images = (p.images || []).map((img: any) => {
    const url = img.media?.path || img.path;
    return url;
  }).filter(Boolean);

  return {
    ...p,
    comparePrice: p.compareAtPrice ?? p.comparePrice,
    inventory: p.stockQuantity ?? p.inventory ?? 0,
    images: images.length > 0 ? images : (p.images || []),
    rawImages: p.images || [],
    specifications: p.specifications ? JSON.parse(p.specifications) : null,
    tags: p.tags ? JSON.parse(p.tags) : [],
    seo: p.seo ? JSON.parse(p.seo) : null,
    variants: (p.variants || []).map((v: any) => ({
      ...v,
      inventory: v.stockQuantity ?? v.inventory ?? 0,
      options: v.attributes ? (typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes) : {},
      images: (v.images || []).map((vImg: any) => vImg.media?.path || vImg.path).filter(Boolean),
    })),
  };
}
