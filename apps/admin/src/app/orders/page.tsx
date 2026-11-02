"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Trash2,
  Loader2,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  CreditCard,
  Ban,
  ArrowRightLeft
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { fetchApi } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export default function OrdersListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Query Orders
  const { data, isLoading } = useQuery({
    queryKey: ['orders', search, statusFilter, paymentStatusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (paymentStatusFilter) params.append('paymentStatus', paymentStatusFilter);

      return fetchApi(`/orders?${params.toString()}`);
    },
  });

  const orders = data?.items || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchApi(`/orders/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setDeleteConfirmId(null);
      addToast('Order deleted successfully', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Delete failed', 'error'),
  });

  // Status Badge Helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Pending</span>;
      case 'CONFIRMED': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><CheckCircle2 className="w-3 h-3" /> Confirmed</span>;
      case 'PROCESSING': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"><Package className="w-3 h-3" /> Processing</span>;
      case 'SHIPPED': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200"><Truck className="w-3 h-3" /> Shipped</span>;
      case 'DELIVERED': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
      case 'CANCELLED': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200"><Ban className="w-3 h-3" /> Cancelled</span>;
      case 'REFUNDED': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"><ArrowRightLeft className="w-3 h-3" /> Refunded</span>;
      default: return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">UNPAID</span>;
      case 'PAID': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">PAID</span>;
      case 'FAILED': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">FAILED</span>;
      case 'REFUNDED': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-800">REFUNDED</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
            <p className="text-sm text-slate-500 mt-1">
              View and manage customer orders, fulfillments, and payments.
            </p>
          </div>
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
              placeholder="Search by order ID, email, or name..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Fulfillment Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            >
              <option value="">All Fulfillment Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            >
              <option value="">All Payment Status</option>
              <option value="PENDING">Unpaid</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <span className="text-xs">Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No orders found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {search || statusFilter || paymentStatusFilter
                  ? 'Try adjusting your search and filter criteria.'
                  : 'When customers place orders on your storefront, they will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Order</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Fulfillment</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="p-4">
                        <Link href={`/orders/${order.id}`} className="font-bold text-indigo-600 hover:text-indigo-800">
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{order.customerName || 'Guest User'}</div>
                        <div className="text-[11px] text-slate-500">{order.customerEmail}</div>
                      </td>
                      <td className="p-4">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-4 text-right font-bold text-slate-900">
                        ${order.total?.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/orders/${order.id}`}
                            title="View Order Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(order.id)}
                            title="Delete Order"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
        title="Delete Order"
        message="Are you sure you want to permanently delete this order? This action cannot be undone and will remove all order items and history."
        isLoading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
