"use client";

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Package,
  FolderTree,
  Image as ImageIcon,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Store,
  Layers,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { fetchApi } from '../services/api';
import { useAuthStore } from '../stores/auth';

export default function DashboardOverviewPage() {
  const { user } = useAuthStore();

  const { data: productsData } = useQuery({
    queryKey: ['dashboard-products'],
    queryFn: () => fetchApi('/products?limit=5'),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['dashboard-categories'],
    queryFn: () => fetchApi('/categories?tree=true'),
  });

  const { data: mediaItems = [] } = useQuery({
    queryKey: ['dashboard-media'],
    queryFn: () => fetchApi('/media?limit=6'),
  });

  const products = productsData?.items || [];
  const totalProducts = productsData?.meta?.total || 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white shadow-xl shadow-indigo-950/10">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Store Admin Control Center
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back, {user?.firstName || 'Seller'}!
            </h1>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              Your independent multi-tenant storefront is active. Customize your products, configure branding, and preview your live store below.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/products/new"
                className="px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                Add New Product
              </Link>
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-indigo-700/60 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl border border-indigo-500/30 transition-colors flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                Preview Storefront
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-300" />
              </a>
            </div>
          </div>

          {/* Decorative glowing gradient blur */}
          <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Products</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalProducts}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Catalog Active
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Categories</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{categories.length}</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Hierarchical Tree</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FolderTree className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Media Uploads</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{mediaItems.length}</h3>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">Sharp WebP Engine</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ImageIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Store Status</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">Live</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Ready for Orders</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Content Section: Recent Products & Quick Setup Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Products */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                Recent Products
              </h3>
              <Link
                href="/products"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View Catalog <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-slate-500">No products added yet.</p>
                <Link
                  href="/products/new"
                  className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
                >
                  Add First Product
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {products.map((p: any) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {p.images?.[0]?.media?.path ? (
                          <img
                            src={`http://localhost:4000${p.images[0].media.path}`}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/products/${p.id}`}
                          className="text-xs font-bold text-slate-900 hover:text-indigo-600 truncate block"
                        >
                          {p.name}
                        </Link>
                        <span className="text-[11px] text-slate-400">{p.category?.name || 'Unassigned'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-900">${p.price.toFixed(2)}</p>
                      <span
                        className={`text-[10px] font-semibold ${
                          p.isPublished ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {p.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Setup Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Store Setup Guide</h3>

            <div className="space-y-3 text-xs">
              <Link
                href="/products/new"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                    1
                  </div>
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-600">Add Products</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/categories"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                    2
                  </div>
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-600">Create Categories</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/appearance"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                    3
                  </div>
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-600">Customize Colors & Theme</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/templates"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                    4
                  </div>
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-600">Choose Storefront Template</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
