"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Plus,
  Search,
  Filter,
  Copy,
  Trash2,
  Edit2,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  Star,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { fetchApi } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export default function ProductsListPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Query Products
  const { data, isLoading } = useQuery({
    queryKey: ['products', search, categoryId, stockFilter, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
      });
      if (search) params.append('search', search);
      if (categoryId) params.append('categoryId', categoryId);
      if (stockFilter === 'inStock') params.append('inStock', 'true');
      if (statusFilter) params.append('isPublished', statusFilter === 'published' ? 'true' : 'false');

      return fetchApi(`/products?${params.toString()}`);
    },
  });

  const products = data?.items || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  // Query Categories for filter
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const res = await fetchApi('/categories');
      return res || [];
    },
  });

  // Duplicate Mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchApi(`/products/${id}/duplicate`, { method: 'POST' });
    },
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      addToast(`Product duplicated as "${newProduct.name}"`, 'success');
    },
    onError: (err: any) => addToast(err.message || 'Duplication failed', 'error'),
  });

  // Toggle Publish Mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      return fetchApi(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      addToast('Product status updated', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Status update failed', 'error'),
  });

  // Toggle Featured Mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      return fetchApi(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isFeatured }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      addToast('Featured status updated', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Update failed', 'error'),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchApi(`/products/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteConfirmId(null);
      addToast('Product deleted successfully', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Delete failed', 'error'),
  });

  const getPrimaryImageUrl = (p: any) => {
    if (!p.images || p.images.length === 0) return null;
    const primary = p.images.find((img: any) => img?.isPrimary) || p.images[0];
    const raw = typeof primary === 'string' ? primary : (primary?.media?.path || primary?.path || primary?.url);
    if (!raw) return null;
    if (raw.startsWith('http')) return raw;
    return `http://localhost:4000${raw}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your product catalog, prices, inventory levels, and variants.
            </p>
          </div>

          <Link
            href="/products/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm w-fit"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, SKU, tags..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft / Unpublished</option>
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            >
              <option value="">All Inventory</option>
              <option value="inStock">In Stock Only</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <span className="text-xs">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {search || categoryId || statusFilter
                  ? 'Try adjusting your search and filter criteria.'
                  : 'Start adding items to your store catalog.'}
              </p>
              <Link
                href="/products/new"
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700"
              >
                Create Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 w-12 text-center">Image</th>
                    <th className="p-4">Product</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Inventory</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p: any) => {
                    const imgUrl = getPrimaryImageUrl(p);
                    const isLowStock = p.trackInventory && p.stockQuantity <= p.lowStockThreshold;
                    const isOutOfStock = p.trackInventory && p.stockQuantity <= 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* Image Thumbnail */}
                        <td className="p-4 text-center">
                          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 mx-auto">
                            {imgUrl ? (
                              <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </td>

                        {/* Product Title & Info */}
                        <td className="p-4 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/products/${p.id}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                            >
                              {p.name}
                            </Link>
                            {p.isFeatured && (
                              <span title="Featured Product" className="text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            {p.sku && <span>SKU: {p.sku}</span>}
                            {p.variants?.length > 0 && (
                              <span>• {p.variants.length} variant(s)</span>
                            )}
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="p-4">
                          <button
                            onClick={() =>
                              togglePublishMutation.mutate({ id: p.id, isPublished: !p.isPublished })
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                              p.isPublished
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                p.isPublished ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {p.isPublished ? 'Published' : 'Draft'}
                          </button>
                        </td>

                        {/* Inventory */}
                        <td className="p-4">
                          {!p.trackInventory ? (
                            <span className="text-slate-500 font-medium">Untracked</span>
                          ) : isOutOfStock ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700">
                              Low: {p.stockQuantity} in stock
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-800">
                              {p.stockQuantity} in stock
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="p-4 text-slate-600 font-medium">
                          {p.category?.name || <span className="text-slate-400">Unassigned</span>}
                        </td>

                        {/* Price */}
                        <td className="p-4 font-bold text-slate-900">
                          ${p.price.toFixed(2)}
                          {p.compareAtPrice && (
                            <span className="text-slate-400 line-through text-[11px] ml-1.5 font-normal">
                              ${p.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                toggleFeaturedMutation.mutate({ id: p.id, isFeatured: !p.isFeatured })
                              }
                              title={p.isFeatured ? 'Unmark Featured' : 'Mark Featured'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                p.isFeatured
                                  ? 'text-amber-500 hover:bg-amber-50'
                                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                              }`}
                            >
                              <Star className={`w-4 h-4 ${p.isFeatured ? 'fill-amber-400' : ''}`} />
                            </button>

                            <button
                              onClick={() => duplicateMutation.mutate(p.id)}
                              title="Duplicate Product"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <Link
                              href={`/products/${p.id}`}
                              title="Edit Product"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              title="Delete Product"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50 text-xs">
              <span className="text-slate-500">
                Showing Page {meta.page} of {meta.totalPages} ({meta.total} products)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
        title="Delete Product"
        message="Are you sure you want to permanently delete this product and its associated variants? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
