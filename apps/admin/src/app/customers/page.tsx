"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { fetchApi } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export default function CustomersListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Query Customers
  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
      });
      if (search) params.append('search', search);
      if (statusFilter !== '') params.append('isActive', statusFilter);

      return fetchApi(`/customers?${params.toString()}`);
    },
  });

  const customers = data?.items || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  // Status Toggle Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return fetchApi(`/customers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      addToast('Customer status updated', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Update failed', 'error'),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchApi(`/customers/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeleteConfirmId(null);
      addToast('Customer deleted successfully', 'success');
    },
    onError: (err: any) => addToast(err.message || 'Delete failed', 'error'),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customers</h1>
            <p className="text-sm text-slate-500 mt-1">
              View and manage your storefront customers and their order history.
            </p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <span className="text-xs">Loading customers...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No customers found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {search || statusFilter
                  ? 'Try adjusting your search and filter criteria.'
                  : 'When visitors register on your storefront, they will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-center">Orders</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((customer: any) => (
                    <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {customer.firstName} {customer.lastName}
                        </div>
                        {customer.phone && <div className="text-[11px] text-slate-500">{customer.phone}</div>}
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {customer.email}
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(customer.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold min-w-[2rem]">
                          {customer.ordersCount || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleStatusMutation.mutate({ id: customer.id, isActive: !customer.isActive })}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            customer.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title={customer.isActive ? "Deactivate Customer" : "Activate Customer"}
                        >
                          {customer.isActive ? (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Active</>
                          ) : (
                            <><XCircle className="w-3.5 h-3.5" /> Inactive</>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDeleteConfirmId(customer.id)}
                            title="Delete Customer"
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
        title="Delete Customer"
        message="Are you sure you want to permanently delete this customer? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
