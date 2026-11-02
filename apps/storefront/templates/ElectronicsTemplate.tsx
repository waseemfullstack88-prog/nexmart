'use client';

import Link from 'next/link';
import { ArrowRight, Cpu, ShieldCheck, Zap, BatteryCharging, Laptop } from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { useStore } from '@/app/providers';

interface ElectronicsTemplateProps {
  products: Product[];
  categories: Category[];
}

export function ElectronicsTemplate({ products, categories }: ElectronicsTemplateProps) {
  const { settings } = useStore();
  const storeName = settings?.storeName || 'ElectroTech';

  const flashDeals = products.filter((p) => p.comparePrice && p.comparePrice > p.price).slice(0, 4);
  const featured = products.filter((p) => p.isFeatured).slice(0, 8);
  const displayProducts = featured.length > 0 ? featured : products.slice(0, 8);

  return (
    <div
      className="space-y-16 pb-16 text-slate-100 min-h-screen"
      style={{ backgroundColor: '#020617', color: '#f8fafc' }}
    >
      {/* Cyber Hero Banner */}
      <section
        className="relative overflow-hidden border-b border-cyan-500/20 py-20"
        style={{
          background: 'linear-gradient(135deg, #020617 0%, #083344 50%, #020617 100%)',
        }}
      >
        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-400">
                <Zap className="w-3.5 h-3.5" />
                <span>NEXT-GEN ARCHITECTURE // 2026 EDITION</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
                High-Performance{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Tech & Hardware
                </span>
              </h1>

              <p className="text-sm md:text-base text-slate-400 max-w-lg leading-relaxed font-sans">
                Engineered for enthusiasts, creators, and power users. Explore cutting-edge components, peripherals, and smart devices.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/products"
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2 transition-all no-underline"
                  style={{ color: '#020617', backgroundColor: '#06b6d4', textDecoration: 'none' }}
                >
                  Shop Hardware <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#deals"
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors no-underline"
                  style={{ color: '#22d3ee', backgroundColor: '#0f172a', textDecoration: 'none' }}
                >
                  Flash Deals
                </Link>
              </div>
            </div>

            {/* Feature Spec Matrix */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Cpu, title: 'Ultra Fast Chipsets', spec: 'Latest Gen Compute' },
                { icon: ShieldCheck, title: '2-Year Warranty', spec: 'Direct Manufacturer Cover' },
                { icon: BatteryCharging, title: 'Extended Battery', spec: 'Optimized Thermal Efficiency' },
                { icon: Zap, title: 'Zero Latency', spec: 'Pro Gaming Calibrated' },
              ].map((spec, i) => {
                const Icon = spec.icon;
                return (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md space-y-2 hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">{spec.title}</h4>
                    <p className="text-[11px] font-mono text-cyan-400/80">{spec.spec}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Category Cards */}
      {categories.length > 0 && (
        <section className="section-container">
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Browse Components
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Hardware Categories
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              [ View Index ]
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all flex items-center justify-between no-underline"
              >
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Explore inventory →
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                  <Laptop className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Flash Deals / Special Offers */}
      {flashDeals.length > 0 && (
        <section id="deals" className="section-container">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/30 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-red-600 text-white rounded">
                  LIMITED TIME
                </span>
                <h3 className="text-lg font-bold text-white">
                  Flash Hardware Deals
                </h3>
              </div>
              <span className="text-xs font-mono text-red-400">
                While Stocks Last
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {flashDeals.map((product) => (
              <ProductCard key={product.id} product={product} styleVariant="bordered" />
            ))}
          </div>
        </section>
      )}

      {/* Featured Catalog */}
      <section className="section-container">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Benchmarked Catalog
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Popular Gear
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            All Products →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} styleVariant="bordered" />
          ))}
        </div>
      </section>
    </div>
  );
}
