'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw, Zap } from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { useStore } from '@/app/providers';

const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000';

interface ModernTemplateProps {
  products: Product[];
  categories: Category[];
}

export function ModernTemplate({ products, categories }: ModernTemplateProps) {
  const { settings } = useStore();
  const storeName = settings?.storeName || 'Modern Store';

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);
  const latestProducts = products.slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden text-white py-24 md:py-32"
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        }}
      >
        <div className="section-container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next Generation Online Shopping</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Elevate Your Everyday with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                {storeName}
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Discover a meticulously curated collection of premium products crafted for style, performance, and everyday longevity.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/products"
                className="px-8 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-xl transition-all flex items-center gap-2 no-underline"
                style={{ color: '#0f172a', backgroundColor: '#ffffff', textDecoration: 'none' }}
              >
                Shop Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#categories"
                className="px-8 py-3.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all no-underline"
                style={{ color: '#ffffff', textDecoration: 'none' }}
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="section-container -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-lg">
          {[
            { icon: Truck, title: 'Express Delivery', desc: 'Fast, secure doorstep shipping' },
            { icon: ShieldCheck, title: 'Authentic Guarantee', desc: '100% genuine verified products' },
            { icon: RotateCcw, title: 'Hassle-Free Returns', desc: '30-day money-back guarantee' },
            { icon: Zap, title: '24/7 Dedicated Support', desc: 'Expert customer assistance anytime' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3.5 p-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories Grid */}
      {categories.length > 0 && (
        <section id="categories" className="section-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                Explore Collections
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                Shop by Category
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              All Categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-xl transition-all text-center flex flex-col items-center justify-center aspect-square no-underline"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-100/50 group-hover:scale-110 transition-transform flex items-center justify-center mb-3 overflow-hidden">
                  {cat.image ? (
                    <img
                      src={`${UPLOADS_URL}${cat.image}`}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">✨</span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Handpicked Selections
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Featured Products
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {displayProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-600">No products available yet.</p>
            <p className="text-xs text-slate-400 mt-1">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="section-container">
        <div
          className="relative overflow-hidden rounded-3xl text-white p-8 md:p-14 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #312e81 0%, #3730a3 50%, #581c87 100%)',
          }}
        >
          <div className="max-w-xl space-y-4 relative z-10">
            <span className="px-3 py-1 text-xs font-bold bg-amber-400 text-slate-950 rounded-full inline-block">
              LIMITED TIME OFFER
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Upgrade Your Lifestyle with Special Seasonal Discounts
            </h2>
            <p className="text-sm text-indigo-200">
              Enjoy premium quality and direct-to-door express delivery on all orders over $50.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="btn-primary bg-white text-slate-900 hover:bg-slate-100 font-bold px-6 py-3 no-underline inline-block rounded-xl"
                style={{ color: '#0f172a', backgroundColor: '#ffffff', textDecoration: 'none' }}
              >
                Claim Special Offer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      {latestProducts.length > 0 && (
        <section className="section-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                Just Arrived
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
