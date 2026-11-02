'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, ArrowUpDown, X, Filter } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { fetchProducts, fetchCategories } from '@/lib/api';
import { useStore } from '@/app/providers';
import { Product, Category } from '@/lib/types';

export default function ProductsPage() {
  const { storeSlug } = useStore();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ['products', storeSlug],
    queryFn: () => fetchProducts(storeSlug),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories', storeSlug],
    queryFn: () => fetchCategories(storeSlug),
  });

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory) {
      result = result.filter(
        (p) => p.categoryId === selectedCategory || p.category?.slug === selectedCategory
      );
    }

    // In Stock
    if (inStockOnly) {
      result = result.filter((p) => p.inventory > 0);
    }

    // Max Price
    if (maxPrice !== '') {
      result = result.filter((p) => p.price <= Number(maxPrice));
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.reverse();
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [products, search, selectedCategory, inStockOnly, maxPrice, sortBy]);

  const hasActiveFilters = Boolean(
    search || selectedCategory || inStockOnly || maxPrice !== ''
  );

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setInStockOnly(false);
    setMaxPrice('');
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header categories={categories} />

      <main className="flex-1 section-container py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            All Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse our entire collection of {products.length} products.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, keyword..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category and Sort Selectors */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>

              {/* In-Stock Toggle */}
              <label className="flex items-center gap-2 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl cursor-pointer select-none text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                In Stock Only
              </label>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid / Empty state */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded-2xl skeleton" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No products match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or clearing your category and price filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
