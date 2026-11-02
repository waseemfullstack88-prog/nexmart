import prisma from '../../config/database';
import { ApiError } from '../../utils';
import { UpdateSettingsInput } from './settings.validation';

export async function getStoreSettings(storeId: string) {
  let settings = await prisma.storeSettings.findUnique({
    where: { storeId },
  });

  if (!settings) {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw ApiError.notFound('Store not found');

    settings = await prisma.storeSettings.create({
      data: {
        storeId,
        storeName: store.name,
      },
    });
  }

  return {
    ...settings,
    address: settings.address ? JSON.parse(settings.address) : null,
    socialLinks: settings.socialLinks ? JSON.parse(settings.socialLinks) : null,
    businessInfo: settings.businessInfo ? JSON.parse(settings.businessInfo) : null,
    imageSettings: settings.imageSettings ? JSON.parse(settings.imageSettings) : null,
    headerConfig: settings.headerConfig ? JSON.parse(settings.headerConfig) : null,
    footerConfig: settings.footerConfig ? JSON.parse(settings.footerConfig) : null,
    seoDefaults: settings.seoDefaults ? JSON.parse(settings.seoDefaults) : null,
  };
}

export async function updateStoreSettings(storeId: string, data: UpdateSettingsInput) {
  const existing = await prisma.storeSettings.findUnique({ where: { storeId } });

  const payload: any = {};
  if (data.storeName !== undefined) payload.storeName = data.storeName;
  if (data.description !== undefined) payload.description = data.description;
  if (data.email !== undefined) payload.email = data.email;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.currency !== undefined) payload.currency = data.currency;
  if (data.currencySymbol !== undefined) payload.currencySymbol = data.currencySymbol;
  if (data.language !== undefined) payload.language = data.language;
  if (data.timezone !== undefined) payload.timezone = data.timezone;
  if (data.logoUrl !== undefined) payload.logoUrl = data.logoUrl;
  if (data.faviconUrl !== undefined) payload.faviconUrl = data.faviconUrl;
  if (data.copyrightText !== undefined) payload.copyrightText = data.copyrightText;
  if (data.address !== undefined) payload.address = JSON.stringify(data.address);
  if (data.socialLinks !== undefined) payload.socialLinks = JSON.stringify(data.socialLinks);
  if (data.businessInfo !== undefined) payload.businessInfo = JSON.stringify(data.businessInfo);
  if (data.imageSettings !== undefined) payload.imageSettings = JSON.stringify(data.imageSettings);

  let updated;
  if (existing) {
    updated = await prisma.storeSettings.update({
      where: { storeId },
      data: payload,
    });
  } else {
    updated = await prisma.storeSettings.create({
      data: {
        storeId,
        ...payload,
      },
    });
  }

  return getStoreSettings(storeId);
}
