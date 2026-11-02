import prisma from '../../config/database';
import { UpdateAppearanceInput } from './appearance.validation';

export async function getStoreAppearance(storeId: string) {
  let appearance = await prisma.storeAppearance.findUnique({
    where: { storeId },
  });

  if (!appearance) {
    appearance = await prisma.storeAppearance.create({
      data: { storeId },
    });
  }

  return {
    ...appearance,
    customCss: appearance.customCss ? JSON.parse(appearance.customCss) : null,
  };
}

export async function updateStoreAppearance(storeId: string, data: UpdateAppearanceInput) {
  const existing = await prisma.storeAppearance.findUnique({ where: { storeId } });

  const payload: any = {
    ...data,
    customCss: data.customCss !== undefined ? JSON.stringify(data.customCss) : undefined,
  };

  if (existing) {
    await prisma.storeAppearance.update({
      where: { storeId },
      data: payload,
    });
  } else {
    await prisma.storeAppearance.create({
      data: {
        storeId,
        ...payload,
      },
    });
  }

  return getStoreAppearance(storeId);
}
