'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { useStore } from '@/app/providers';

const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000';

interface FashionTemplateProps {
  products: Product[];
  categories: Category[];
}

export function FashionTemplate({ products, categories }: FashionTemplateProps) {
  const { settings } = useStore();
  const storeName = settings?.storeName || 'Maison Fashion';

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 6);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 6);

  return (
    <div className="space-y-20 pb-20 font-serif">
      {/* Editorial Hero Section */}
      <section
        className="relative min-h-[75vh] flex items-center justify-center text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4c0519 0%, #831843 50%, #4c0519 100%)',
        }}
      >
        <div className="section-container relative z-10 text-center py-20">
          <span className="inline-block tracking-[0.3em] uppercase text-xs font-semibold text-rose-200 mb-4">
            Haute Couture & Prêt-à-Porter
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight mb-6 max-w-4xl mx-auto leading-[1.15] text-white">
            The Art of Modern Elegance
          </h1>
          <p className="text-base sm:text-lg text-rose-100 font-sans font-normal max-w-xl mx-auto mb-10 leading-relaxed">
            Curated silhouettes and timeless garments designed for bold individuality and effortless grace.
          </p>
          <div className="flex flex-wrap justify-center gap-4 font-sans">
            <Link
              href="/products"
              className="px-8 py-4 bg-white text-rose-950 text-xs uppercase tracking-widest font-bold hover:bg-rose-50 transition-all shadow-2xl no-underline inline-block rounded-xl"
              style={{ color: '#4c0519', backgroundColor: '#ffffff', textDecoration: 'none' }}
            >
              Explore Collection
            </Link>
            <Link
              href="#lookbook"
              className="px-8 py-4 border border-white/40 text-white text-xs uppercase tracking-widest font-semibold hover:bg-white/10 transition-all no-underline inline-block rounded-xl"
              style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
            >
              View Lookbook
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Category Showcase */}
      {categories.length > 0 && (
        <section className="section-container font-sans">
          <div className="text-center max-w-md mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-rose-600 font-bold">
              Collections
            </span>
            <h2 className="text-3xl font-serif font-normal text-slate-900 mt-1">
              Shop by Silhouette
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(0, 3).map((cat, i) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative h-96 rounded-2xl overflow-hidden bg-slate-100 flex flex-col justify-end p-8 no-underline"
              >
                {cat.image ? (
                  <img
                    src={`${UPLOADS_URL}${cat.image}`}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(76,5,25,0.85), rgba(15,23,42,0.4), transparent)' }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="relative z-10 text-white">
                  <span className="text-xs font-mono uppercase tracking-widest text-rose-300">
                    Volume 0{i + 1}
                  </span>
                  <h3 className="text-2xl font-serif font-light mt-1 mb-2 text-white">
                    {cat.name}
                  </h3>
                  <span className="inline-flex items-center text-xs uppercase tracking-wider font-semibold group-hover:translate-x-2 transition-transform text-white">
                    Discover Collection <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Curated Product Grid */}
      <section className="section-container font-sans">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-rose-600 font-bold">
              Must-Haves
            </span>
            <h2 className="text-3xl font-serif font-normal text-slate-900 mt-1">
              Season Highlights
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold uppercase tracking-widest text-slate-800 hover:text-rose-600 transition-colors mt-2 md:mt-0"
          >
            View Full Wardrobe →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} styleVariant="minimal" />
          ))}
        </div>
      </section>

      {/* Lookbook / Brand Statement */}
      <section id="lookbook" className="bg-rose-50/50 py-20 border-y border-rose-100 font-sans">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest text-rose-600 font-bold">
                The Philosophy
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-slate-900 leading-tight">
                Designed for Longevity, Tailored for Presence
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every piece in our catalog is rigorously selected for high-grade textiles, ethical craftsmanship, and timeless cuts that transcend seasonal fast fashion cycles.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="px-6 py-3 bg-slate-900 text-white text-xs uppercase tracking-widest font-bold hover:bg-slate-800 transition-colors rounded-xl no-underline inline-block"
                  style={{ color: '#ffffff', backgroundColor: '#0f172a', textDecoration: 'none' }}
                >
                  Shop The Philosophy
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-2xl bg-rose-200/50 overflow-hidden flex items-center justify-center p-6 text-center text-rose-950 font-serif">
                <p className="italic text-lg">“Fashion changes, but style endures.”</p>
              </div>
              <div className="aspect-[3/4] rounded-2xl bg-slate-900 text-white p-6 flex flex-col justify-between">
                <Sparkles className="w-6 h-6 text-rose-400" />
                <div>
                  <p className="text-2xl font-serif font-bold text-white">100%</p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
                    Ethical Sourcing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
