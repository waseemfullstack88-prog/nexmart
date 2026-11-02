import prisma from '../../config/database';
import { generateSlug, ApiError } from '../../utils';
import { CreateStoreInput, UpdateStoreInput, AddDomainInput } from './stores.validation';
import { StoreStatus } from '../../types/enums';

export async function createStore(userId: string, data: CreateStoreInput) {
  // Check if domain is already taken
  const existingDomain = await prisma.storeDomain.findUnique({
    where: { domain: data.domain },
  });

  if (existingDomain) {
    throw ApiError.conflict('This domain is already registered');
  }

  // Generate unique slug
  let slug = generateSlug(data.name);
  let slugExists = await prisma.store.findUnique({ where: { slug } });
  let counter = 1;
  while (slugExists) {
    slug = `${generateSlug(data.name)}-${counter}`;
    slugExists = await prisma.store.findUnique({ where: { slug } });
    counter++;
  }

  // Use transaction to create store, domain, settings, and appearance
  const store = await prisma.$transaction(async (tx) => {
    const newStore = await tx.store.create({
      data: {
        name: data.name,
        slug,
        ownerId: userId,
        status: StoreStatus.ACTIVE,
        domains: {
          create: {
            domain: data.domain,
            isPrimary: true,
            isVerified: true, // Auto-verify in development
          },
        },
        settings: {
          create: {
            storeName: data.name,
            currency: 'USD',
          },
        },
        appearance: {
          create: {},
        },
      },
      include: {
        domains: true,
      },
    });

    // Update user's storeId if they don't have one
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (user && !user.storeId) {
      await tx.user.update({
        where: { id: userId },
        data: { storeId: newStore.id },
      });
    }

    return newStore;
  });

  return store;
}

export async function getStoreDetails(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      domains: true,
      settings: true,
      appearance: true,
      template: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!store) {
    throw ApiError.notFound('Store not found');
  }

  return store;
}

export async function updateStore(storeId: string, data: UpdateStoreInput) {
  const store = await prisma.store.update({
    where: { id: storeId },
    data,
  });

  return store;
}

export async function addDomain(storeId: string, data: AddDomainInput) {
  const existingDomain = await prisma.storeDomain.findUnique({
    where: { domain: data.domain },
  });

  if (existingDomain) {
    throw ApiError.conflict('This domain is already registered');
  }

  return prisma.$transaction(async (tx) => {
    if (data.isPrimary) {
      // Unset existing primary domain
      await tx.storeDomain.updateMany({
        where: { storeId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const domain = await tx.storeDomain.create({
      data: {
        storeId,
        domain: data.domain,
        isPrimary: data.isPrimary ?? false,
      },
    });

    return domain;
  });
}

export async function removeDomain(storeId: string, domainId: string) {
  const domain = await prisma.storeDomain.findUnique({
    where: { id: domainId },
  });

  if (!domain || domain.storeId !== storeId) {
    throw ApiError.notFound('Domain not found');
  }

  if (domain.isPrimary) {
    throw ApiError.badRequest('Cannot delete the primary domain. Set another domain as primary first.');
  }

  await prisma.storeDomain.delete({
    where: { id: domainId },
  });
}
