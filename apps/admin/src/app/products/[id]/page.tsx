"use client";

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '../../../components/layout/AdminLayout';
import { ProductForm } from '../../../components/products/ProductForm';
import { fetchApi } from '../../../services/api';
import { useToast } from '../../../components/ui/Toast';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchApi(`/products/${id}`),
  });

  const handleUpdate = async (data: any) => {
    setIsSaving(true);
    try {
      await fetchApi(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      addToast('Product updated successfully!', 'success');
      router.push('/products');
    } catch (err: any) {
      addToast(err.message || 'Failed to update product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <span className="text-xs text-slate-500 font-medium">Loading product details...</span>
        </div>
      ) : !product ? (
        <div className="text-center py-12">
          <p className="text-sm font-semibold text-slate-800">Product not found</p>
        </div>
      ) : (
        <ProductForm
          title={`Edit: ${product.name}`}
          initialData={product}
          onSubmit={handleUpdate}
          isLoading={isSaving}
        />
      )}
    </AdminLayout>
  );
}
