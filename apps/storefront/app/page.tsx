import { headers } from 'next/headers';
import { resolveStoreSlug, fetchProducts, fetchCategories, fetchStore } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TemplateRenderer } from '@/templates/TemplateRenderer';
import { Product, Category } from '@/lib/types';

export default async function HomePage() {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const storeSlug = resolveStoreSlug(hostname);

  let products: Product[] = [];
  let categories: Category[] = [];
  let templateId = 'modern';

  try {
    const [storeRes, productsRes, categoriesRes] = await Promise.allSettled([
      fetchStore(storeSlug),
      fetchProducts(storeSlug),
      fetchCategories(storeSlug),
    ]);

    if (storeRes.status === 'fulfilled' && storeRes.value) {
      templateId = storeRes.value.templateId || 'modern';
    }

    if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value)) {
      products = productsRes.value;
    }

    if (categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value)) {
      categories = categoriesRes.value;
    }
  } catch (error) {
    console.error('Failed to load home page data:', error);
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header categories={categories} />
      <main className="flex-1">
        <TemplateRenderer
          templateId={templateId}
          products={products}
          categories={categories}
        />
      </main>
      <Footer />
    </div>
  );
}
