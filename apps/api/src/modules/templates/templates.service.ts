import prisma from '../../config/database';
import { ApiError } from '../../utils';

export async function getAllTemplates() {
  const templates = await prisma.template.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  return templates.map((t) => ({
    ...t,
    defaultConfig: t.defaultConfig ? JSON.parse(t.defaultConfig) : null,
    sectionsConfig: t.sectionsConfig ? JSON.parse(t.sectionsConfig) : null,
  }));
}

export async function getStoreTemplate(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      template: true,
    },
  });

  if (!store) throw ApiError.notFound('Store not found');

  let template = store.template;
  if (!template) {
    // Default to first active template
    template = await prisma.template.findFirst({ where: { isActive: true } });
    if (template) {
      await prisma.store.update({
        where: { id: storeId },
        data: { templateId: template.id },
      });
    }
  }

  if (!template) throw ApiError.notFound('No template available');

  return {
    ...template,
    defaultConfig: template.defaultConfig ? JSON.parse(template.defaultConfig) : null,
    sectionsConfig: template.sectionsConfig ? JSON.parse(template.sectionsConfig) : null,
  };
}

export async function switchStoreTemplate(storeId: string, templateId: string) {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!template || !template.isActive) {
    throw ApiError.badRequest('Selected template does not exist or is inactive');
  }

  // Update store template pointer. All products, categories, orders, media stay 100% intact!
  await prisma.store.update({
    where: { id: storeId },
    data: { templateId: template.id },
  });

  return getStoreTemplate(storeId);
}
