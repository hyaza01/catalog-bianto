import { apiFetch } from '@/lib/api-client';
import { Category, PaginatedResponse, Product } from '@/features/products/types';

export async function getPublicCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/public/categories', {
    cache: 'force-cache',
    next: { revalidate: 300, tags: ['categories'] },
  });
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return apiFetch<Category>(`/public/categories/${slug}`, {
    cache: 'force-cache',
    next: { revalidate: 300, tags: ['categories', `category-${slug}`] },
  });
}

export async function getCategoryProducts(
  slug: string,
  page = 1,
): Promise<PaginatedResponse<Product>> {
  return apiFetch<PaginatedResponse<Product>>(`/public/categories/${slug}/products?page=${page}&limit=12`, {
    cache: 'force-cache',
    next: { revalidate: 120, tags: ['products', `category-${slug}`] },
  });
}
