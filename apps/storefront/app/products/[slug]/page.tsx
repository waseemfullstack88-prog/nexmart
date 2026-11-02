'use client';

import { useState, use, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { fetchProduct, fetchProducts, fetchCategories } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { useStore } from '@/app/providers';
import { Product, ProductVariant } from '@/lib/types';

const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { storeSlug, settings, appearance } = useStore();
  const addItem = useCart((s) => s.addItem);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const { data: product, isLoading: loadingProduct } = useQuery<Product>({
    queryKey: ['product', storeSlug, slug],
    queryFn: () => fetchProduct(storeSlug, slug),
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products', storeSlug],
    queryFn: () => fetchProducts(storeSlug),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', storeSlug],
    queryFn: () => fetchCategories(storeSlug),
  });

  // Extract available variant option keys (e.g. ['Size', 'Color'])
  const variantOptionKeys = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];
    const keys = new Set<string>();
    product.variants.forEach((v) => {
      if (v.options) {
        Object.keys(v.options).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [product]);

  // Find currently active variant matching chosen options
  const activeVariant: ProductVariant | undefined = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return undefined;
    return product.variants.find((v) => {
      return Object.entries(selectedOptions).every(
        ([key, val]) => v.options?.[key] === val
      );
    });
  }, [product, selectedOptions]);

  const currencySymbol = settings?.currencySymbol || '$';
  const effectivePrice = activeVariant ? activeVariant.price : product?.price || 0;
  const effectiveComparePrice = activeVariant ? activeVariant.comparePrice : product?.comparePrice;
  const effectiveInventory = activeVariant ? activeVariant.inventory : product?.inventory || 0;

  const images = useMemo(() => {
    if (activeVariant?.images && activeVariant.images.length > 0) {
      return activeVariant.images;
    }
    return product?.images || [];
  }, [product, activeVariant]);

  const currentImage = images[selectedImageIndex] || images[0] || null;

  const getImageUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${UPLOADS_URL}${url}`;
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      variantId: activeVariant?.id,
      name: product.name,
      slug: product.slug,
      image: currentImage || undefined,
      price: effectivePrice,
      comparePrice: effectiveComparePrice,
      quantity,
      variant: activeVariant
        ? {
            name: activeVariant.name,
            options: activeVariant.options,
          }
        : undefined,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
      .slice(0, 4);
  }, [allProducts, product]);

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Header categories={categories} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Header categories={categories} />
        <div className="flex-1 section-container py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">The product you are looking for does not exist or has been removed.</p>
          <Link href="/products" className="btn-primary mt-6 inline-block">
            Back to Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const hasDiscount = effectiveComparePrice && effectiveComparePrice > effectivePrice;
  const discountPercent = hasDiscount
    ? Math.round(((effectiveComparePrice! - effectivePrice) / effectiveComparePrice!) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header categories={categories} />

      <main className="flex-1 section-container py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 overflow-x-auto">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-slate-900 transition-colors">
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                href={`/category/${product.category.slug}`}
                className="hover:text-slate-900 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Gallery Column */}
          <div className="space-y-4">
            {/* Main Stage */}
            <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 relative">
              {currentImage ? (
                <img
                  src={getImageUrl(currentImage)!}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  🛍️
                </div>
              )}

              {hasDiscount && (
                <span className="absolute top-4 left-4 badge badge-sale text-xs px-3 py-1 font-bold shadow-md">
                  SAVE {discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)!}
                      alt={`${product.name} thumb ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Column */}
          <div className="space-y-6">
            {product.category && (
              <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-full">
                {product.category.name}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-3xl font-extrabold" style={{ color: 'var(--color-primary)' }}>
                {currencySymbol}{effectivePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-base text-slate-400 line-through">
                  {currencySymbol}{effectiveComparePrice!.toFixed(2)}
                </span>
              )}
              {effectiveInventory > 0 ? (
                <span className="ml-auto text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In Stock ({effectiveInventory} left)
                </span>
              ) : (
                <span className="ml-auto text-xs font-semibold text-red-500">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Dynamic Variant Selectors */}
            {variantOptionKeys.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                {variantOptionKeys.map((optionKey) => {
                  const uniqueValues = Array.from(
                    new Set(
                      product.variants
                        .map((v) => v.options?.[optionKey])
                        .filter(Boolean)
                    )
                  );

                  return (
                    <div key={optionKey} className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {optionKey}:{' '}
                        <span className="text-indigo-600 font-medium">
                          {selectedOptions[optionKey] || 'Choose one'}
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {uniqueValues.map((val) => {
                          const isSelected = selectedOptions[optionKey] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() =>
                                setSelectedOptions((prev) => ({
                                  ...prev,
                                  [optionKey]: val,
                                }))
                              }
                              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                                isSelected
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-slate-200 transition-colors text-slate-600"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-slate-200 transition-colors text-slate-600"
                    disabled={effectiveInventory > 0 && quantity >= effectiveInventory}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={effectiveInventory <= 0}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'btn-primary'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart!
                    </>
                  ) : effectiveInventory <= 0 ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Cart — {currencySymbol}
                      {(effectivePrice * quantity).toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-600">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Express Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-600">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Verified Quality</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-600">
                <RotateCcw className="w-4 h-4 text-indigo-600" />
                <span>30-Day Returns</span>
              </div>
            </div>

            {/* Description Tab */}
            {product.description && (
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Description</h3>
                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pt-12 border-t border-slate-200">
            <h3 className="text-xl font-extrabold text-slate-900 mb-6">
              You May Also Like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
