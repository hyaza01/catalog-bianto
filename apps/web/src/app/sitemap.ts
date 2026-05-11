import type { MetadataRoute } from 'next';
import env from '@/config/env';

type Product = { slug: string; updatedAt: string };
type Category = { slug: string; updatedAt: string };
type Paginated<T> = { data: T[]; meta: { totalPages: number } };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.siteUrl;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/catalogo`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/contato`, changeFrequency: 'monthly', priority: 0.7 },
  ];

  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(`${env.apiUrl}/public/products?page=1&limit=200`, { cache: 'no-store' }),
      fetch(`${env.apiUrl}/public/categories`, { cache: 'no-store' }),
    ]);

    const productsJson = (await productsResponse.json()) as Paginated<Product>;
    const categoriesJson = (await categoriesResponse.json()) as Category[];

    const productRoutes = productsJson.data.map((product) => ({
      url: `${baseUrl}/produtos/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const categoryRoutes = categoriesJson.map((category) => ({
      url: `${baseUrl}/categorias/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
