'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Eye, Heart, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart';
import { useStore } from '@/app/providers';

const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000';

interface ProductCardProps {
  product: Product;
  styleVariant?: 'default' | 'minimal' | 'bordered' | 'shadow';
}

export function ProductCard({ product, styleVariant }: ProductCardProps) {
  const { settings, appearance } = useStore();
  const addItem = useCart((s) => s.addItem);
  const [isAdded, setIsAdded] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const cardStyle = styleVariant || appearance?.productCardStyle || 'default';
  const currencySymbol = settings?.currencySymbol || '$';
  const imageFit = appearance?.imageFit || 'AUTO';

  const primaryImage = product.images?.[0] || null;
  const secondaryImage = product.images?.[1] || primaryImage;

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  const getImageUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${UPLOADS_URL}${url}`;
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: primaryImage || undefined,
      price: product.price,
      comparePrice: product.comparePrice,
      quantity: 1,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const displayImage = hoveredImage || primaryImage;

  // Container styling depending on card style setting
  const containerClasses = {
    default: 'bg-white border border-slate-100/80 shadow-xs hover:shadow-xl transition-all duration-300',
    minimal: 'bg-transparent border-0 hover:opacity-95 transition-opacity',
    bordered: 'bg-white border-2 border-slate-200 hover:border-indigo-500 transition-colors',
    shadow: 'bg-white shadow-md hover:shadow-2xl transition-all duration-300 -translate-y-0.5 hover:-translate-y-1.5',
  }[cardStyle] || 'bg-white border border-slate-100 shadow-xs hover:shadow-xl transition-all duration-300';

  const fitClass = imageFit === 'CONTAIN' ? 'object-contain' : 'object-cover';

  return (
    <div
      className={`group relative flex flex-col rounded-2xl overflow-hidden ${containerClasses}`}
      onMouseEnter={() => secondaryImage && setHoveredImage(secondaryImage)}
      onMouseLeave={() => setHoveredImage(null)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {hasDiscount && (
          <span className="badge badge-sale shadow-xs text-[11px] px-2.5 py-0.5 font-bold">
            -{discountPercent}%
          </span>
        )}
        {product.isFeatured && (
          <span className="badge badge-new shadow-xs text-[10px] px-2 py-0.5 font-semibold">
            Featured
          </span>
        )}
        {product.inventory <= 0 && (
          <span className="badge bg-slate-800 text-white text-[10px] px-2 py-0.5">
            Out of Stock
          </span>
        )}
      </div>

      {/* Image Wrap */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square w-full bg-slate-50 overflow-hidden"
      >
        {displayImage ? (
          <img
            src={getImageUrl(displayImage)!}
            alt={product.name}
            className={`w-full h-full ${fitClass} group-hover:scale-105 transition-transform duration-500`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300 text-3xl font-light">
            🛍️
          </div>
        )}

        {/* Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
          <button
            onClick={handleQuickAdd}
            disabled={product.inventory <= 0}
            className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform translate-y-2 group-hover:translate-y-0 ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-white/95 backdrop-blur-md text-slate-900 hover:bg-white'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added!
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.category && (
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {product.category.name}
            </p>
          )}

          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="price-current">
              {currencySymbol}{product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="price-compare">
                {currencySymbol}{product.comparePrice!.toFixed(2)}
              </span>
            )}
          </div>

          {product.variants && product.variants.length > 0 && (
            <span className="text-[10px] text-slate-400 font-medium">
              {product.variants.length} options
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
