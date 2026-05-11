import { notFound } from 'next/navigation';
import { Pagination } from '@/components/common/Pagination';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { getCategoryBySlug, getCategoryProducts } from '@/features/categories/services/categories.service';
import { buildMetadata } from '@/lib/seo';

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;

  return buildMetadata({
    title: `Categoria ${slug}`,
    canonicalPath: `/categorias/${slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const page = Number((await searchParams).page ?? '1');

  try {
    const [category, products] = await Promise.all([
      getCategoryBySlug(slug),
      getCategoryProducts(slug, page),
    ]);

    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-semibold text-[var(--neutral-950)]">{category.name}</h1>
          <p className="mt-2 text-[var(--neutral-700)]">
            Produtos da categoria selecionada com filtros e navegacao paginada.
          </p>
        </header>

        <ProductGrid products={products.data} />

        <Pagination
          currentPage={products.meta.page}
          totalPages={products.meta.totalPages}
          buildHref={(newPage) => `/categorias/${slug}?page=${newPage}`}
        />
      </div>
    );
  } catch {
    notFound();
  }
}

