"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '../../../components/layout/AdminLayout';
import { ProductForm } from '../../../components/products/ProductForm';
import { fetchApi } from '../../../services/api';
import { useToast } from '../../../components/ui/Toast';

export default function NewProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleCreate = async (data: any) => {
    setIsLoading(true);
    try {
      const created = await fetchApi('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      addToast(`Product "${created.name}" created successfully!`, 'success');
      router.push('/products');
    } catch (err: any) {
      addToast(err.message || 'Failed to create product', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <ProductForm title="Create New Product" onSubmit={handleCreate} isLoading={isLoading} />
    </AdminLayout>
  );
}
