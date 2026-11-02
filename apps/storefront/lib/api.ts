import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const DEFAULT_STORE_SLUG = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG || 'demo-store';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Resolve which store slug to use, given a request hostname.
 * In production, the hostname's subdomain or custom domain would be used.
 * In development, the DEFAULT_STORE_SLUG is used.
 */
export function resolveStoreSlug(hostname?: string): string {
  if (!hostname) return DEFAULT_STORE_SLUG;
  // Strip port in dev
  const host = hostname.split(':')[0];
  // e.g. "mystore.localhost" → "mystore"
  if (host.endsWith('.localhost')) {
    return host.replace('.localhost', '');
  }
  // In production: store1.nexmart.com → store1
  const parts = host.split('.');
  if (parts.length >= 3) return parts[0];
  return DEFAULT_STORE_SLUG;
}

/** Fetch store data by slug — used in Server Components */
export async function fetchStore(slug: string) {
  const res = await apiClient.get(`/stores/slug/${slug}`);
  return res.data?.data;
}

/** Fetch store appearance */
export async function fetchAppearance(storeSlug: string) {
  const res = await apiClient.get(`/appearance`, {
    headers: { 'x-store-slug': storeSlug },
  });
  return res.data?.data;
}

/** Fetch store settings */
export async function fetchSettings(storeSlug: string) {
  const res = await apiClient.get(`/settings`, {
    headers: { 'x-store-slug': storeSlug },
  });
  return res.data?.data;
}

/** Fetch products for a store */
export async function fetchProducts(storeSlug: string, params?: Record<string, string>) {
  const res = await apiClient.get(`/products`, {
    headers: { 'x-store-slug': storeSlug },
    params: { status: 'ACTIVE', ...params },
  });
  return res.data?.data;
}

/** Fetch single product by slug */
export async function fetchProduct(storeSlug: string, productSlug: string) {
  const res = await apiClient.get(`/products/slug/${productSlug}`, {
    headers: { 'x-store-slug': storeSlug },
  });
  return res.data?.data;
}

/** Fetch categories for a store */
export async function fetchCategories(storeSlug: string) {
  const res = await apiClient.get(`/categories`, {
    headers: { 'x-store-slug': storeSlug },
  });
  return res.data?.data;
}
