'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Filter } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { fetchProducts, fetchCategories } from '@/lib/api';
import { useStore } from '@/app/providers';
import { Product, Category } from '@/lib/types';

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { storeSlug } = useStore();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories', storeSlug],
    queryFn: () => fetchCategories(storeSlug),
  });

  const currentCategory = categories.find((c) => c.slug === slug);

  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ['products', storeSlug, slug],
    queryFn: () => fetchProducts(storeSlug),
  });

  const categoryProducts = products.filter(
    (p) => p.category?.slug === slug || p.categoryId === currentCategory?.id
  );

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header categories={categories} />

      <main className="flex-1 section-container py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-slate-900 transition-colors">
            Categories
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">
            {currentCategory?.name || slug}
          </span>
        </nav>

        {/* Category Hero */}
        <div className="mb-10 bg-slate-50 p-8 rounded-3xl border border-slate-100">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {currentCategory?.name || 'Category'}
          </h1>
          {currentCategory?.description && (
            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              {currentCategory.description}
            </p>
          )}
          <p className="text-xs font-semibold text-indigo-600 mt-4">
            Showing {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Products Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded-2xl skeleton" />
            ))}
          </div>
        ) : categoryProducts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Filter className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">
              No products found in this category
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Check back soon as we expand our inventory.
            </p>
            <Link href="/products" className="btn-primary mt-6 inline-block text-xs">
              Explore All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
