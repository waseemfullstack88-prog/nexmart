'use client';

import { useSearchParams } from 'next/navigation';
import { Product, Category } from '@/lib/types';
import { ModernTemplate } from './ModernTemplate';
import { FashionTemplate } from './FashionTemplate';
import { ElectronicsTemplate } from './ElectronicsTemplate';

interface TemplateRendererProps {
  templateId?: string;
  products: Product[];
  categories: Category[];
}

export function TemplateRenderer({
  templateId = 'modern',
  products,
  categories,
}: TemplateRendererProps) {
  const searchParams = useSearchParams();
  const previewParam = searchParams.get('template_preview');

  const activeTemplate = previewParam || templateId;

  switch (activeTemplate.toLowerCase()) {
    case 'fashion':
      return <FashionTemplate products={products} categories={categories} />;
    case 'electronics':
      return <ElectronicsTemplate products={products} categories={categories} />;
    case 'modern':
    default:
      return <ModernTemplate products={products} categories={categories} />;
  }
}
