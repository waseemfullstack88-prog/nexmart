import prisma from '../../config/database';
import { ApiError, generateSlug } from '../../utils';
import { CreateCategoryInput, UpdateCategoryInput, ReorderCategoriesInput } from './categories.validation';

export async function getStoreCategories(storeId: string, options: { includeDisabled?: boolean; tree?: boolean } = {}) {
  const where: any = { storeId };
  if (!options.includeDisabled) {
    where.isEnabled = true;
  }

  const categories = await prisma.category.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
    include: {
      image: {
        select: {
          id: true,
          path: true,
          originalName: true,
          variants: true,
          altText: true,
        },
      },
      _count: {
        select: { products: true },
      },
    },
  });

  const formatted = categories.map((cat) => ({
    ...cat,
    image: cat.image ? {
      ...cat.image,
      variants: cat.image.variants ? JSON.parse(cat.image.variants as string) : null,
    } : null,
    seo: cat.seo ? JSON.parse(cat.seo as string) : null,
    productCount: cat._count.products,
  }));

  if (options.tree) {
    return buildCategoryTree(formatted);
  }

  return formatted;
}

function buildCategoryTree(categories: any[], parentId: string | null = null): any[] {
  return categories
    .filter((cat) => cat.parentId === parentId)
    .map((cat) => ({
      ...cat,
      children: buildCategoryTree(categories, cat.id),
    }));
}

export async function getCategoryByIdOrSlug(storeId: string, idOrSlug: string) {
  const category = await prisma.category.findFirst({
    where: {
      storeId,
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      image: true,
      parent: {
        select: { id: true, name: true, slug: true },
      },
      children: {
        include: {
          image: true,
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  return {
    ...category,
    image: category.image ? {
      ...category.image,
      variants: category.image.variants ? JSON.parse(category.image.variants as string) : null,
    } : null,
    seo: category.seo ? JSON.parse(category.seo as string) : null,
    productCount: category._count.products,
  };
}

export async function createCategory(storeId: string, data: CreateCategoryInput) {
  let slug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);

  // Ensure unique slug per store
  let existing = await prisma.category.findFirst({
    where: { storeId, slug },
  });
  let counter = 1;
  while (existing) {
    slug = `${generateSlug(data.slug || data.name)}-${counter}`;
    existing = await prisma.category.findFirst({ where: { storeId, slug } });
    counter++;
  }

  // Validate parent if provided
  if (data.parentId) {
    const parent = await prisma.category.findFirst({
      where: { id: data.parentId, storeId },
    });
    if (!parent) throw ApiError.badRequest('Parent category not found');
  }

  // Validate image if provided
  if (data.imageMediaId) {
    const media = await prisma.media.findFirst({
      where: { id: data.imageMediaId, storeId },
    });
    if (!media) throw ApiError.badRequest('Image media not found');
  }

  const category = await prisma.category.create({
    data: {
      storeId,
      name: data.name,
      slug,
      description: data.description,
      parentId: data.parentId,
      imageMediaId: data.imageMediaId,
      sortOrder: data.sortOrder ?? 0,
      isEnabled: data.isEnabled ?? true,
      seo: data.seo ? JSON.stringify(data.seo) : null,
    },
    include: {
      image: true,
    },
  });

  return {
    ...category,
    image: category.image ? {
      ...category.image,
      variants: category.image.variants ? JSON.parse(category.image.variants as string) : null,
    } : null,
    seo: category.seo ? JSON.parse(category.seo as string) : null,
  };
}

export async function updateCategory(storeId: string, categoryId: string, data: UpdateCategoryInput) {
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, storeId },
  });

  if (!existing) {
    throw ApiError.notFound('Category not found');
  }

  if (data.parentId === categoryId) {
    throw ApiError.badRequest('A category cannot be its own parent');
  }

  let slug = existing.slug;
  if (data.slug && data.slug !== existing.slug) {
    slug = generateSlug(data.slug);
    const slugCheck = await prisma.category.findFirst({
      where: { storeId, slug, id: { not: categoryId } },
    });
    if (slugCheck) throw ApiError.conflict('Category slug is already in use');
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: data.name !== undefined ? data.name : existing.name,
      slug,
      description: data.description !== undefined ? data.description : existing.description,
      parentId: data.parentId !== undefined ? data.parentId : existing.parentId,
      imageMediaId: data.imageMediaId !== undefined ? data.imageMediaId : existing.imageMediaId,
      sortOrder: data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder,
      isEnabled: data.isEnabled !== undefined ? data.isEnabled : existing.isEnabled,
      seo: data.seo !== undefined ? JSON.stringify(data.seo) : existing.seo,
    },
    include: {
      image: true,
    },
  });

  return {
    ...updated,
    image: updated.image ? {
      ...updated.image,
      variants: updated.image.variants ? JSON.parse(updated.image.variants as string) : null,
    } : null,
    seo: updated.seo ? JSON.parse(updated.seo as string) : null,
  };
}

export async function deleteCategory(storeId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, storeId },
    include: {
      children: true,
      _count: { select: { products: true } },
    },
  });

  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  if (category.children.length > 0) {
    // Reparent children to null or parent
    await prisma.category.updateMany({
      where: { parentId: categoryId },
      data: { parentId: category.parentId },
    });
  }

  // Nullify product references
  await prisma.product.updateMany({
    where: { categoryId },
    data: { categoryId: null },
  });

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { success: true, message: 'Category deleted successfully' };
}

export async function reorderCategories(storeId: string, data: ReorderCategoriesInput) {
  await prisma.$transaction(
    data.items.map((item) =>
      prisma.category.update({
        where: { id: item.id },
        data: {
          sortOrder: item.sortOrder,
          ...(item.parentId !== undefined ? { parentId: item.parentId } : {}),
        },
      })
    )
  );

  return { success: true };
}
