import { apiFetch } from '@/lib/api-client';
import { PaginatedResponse, Product } from '../types';

export type CatalogFilters = {
  search?: string;
  categorySlug?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sort?: string;
};

function toQueryString(filters: CatalogFilters): string {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.categorySlug) params.set('categorySlug', filters.categorySlug);
  if (filters.tags) params.set('tags', filters.tags);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.sort) params.set('sort', filters.sort);

  return params.toString();
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/public/products/featured', {
    cache: 'force-cache',
    next: { revalidate: 300, tags: ['products', 'featured'] },
  });
}

export async function getCatalogProducts(filters: CatalogFilters): Promise<PaginatedResponse<Product>> {
  const queryString = toQueryString(filters);

  return apiFetch<PaginatedResponse<Product>>(`/public/products${queryString ? `?${queryString}` : ''}`, {
    cache: 'force-cache',
    next: { revalidate: 120, tags: ['products'] },
  });
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return apiFetch<Product>(`/public/products/${slug}`, {
    cache: 'force-cache',
    next: { revalidate: 300, tags: ['products', `product-${slug}`] },
  });
}

export async function getRelatedProducts(slug: string): Promise<Product[]> {
  return apiFetch<Product[]>(`/public/products/${slug}/related`, {
    cache: 'force-cache',
    next: { revalidate: 300, tags: ['products', `product-${slug}`] },
  });
}
