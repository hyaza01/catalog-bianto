import Link from 'next/link';
import { Pagination } from '@/components/common/Pagination';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { getPublicCategories } from '@/features/categories/services/categories.service';
import { getCatalogProducts } from '@/features/products/services/products.service';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Catalogo de produtos personalizados',
  description: 'Explore canecas personalizadas por categoria, busca textual e filtros de interesse.',
  canonicalPath: '/catalogo',
});

export const dynamic = 'force-dynamic';

type CatalogPageProps = {
  searchParams: Promise<{
    search?: string;
    categorySlug?: string;
    page?: string;
    tags?: string;
    sort?: string;
  }>;
};

function buildPaginationHref(current: Record<string, string | undefined>, page: number): string {
  const params = new URLSearchParams();

  Object.entries(current).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  params.set('page', String(page));

  return `/catalogo?${params.toString()}`;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const page = Number(params.page ?? '1');

  const [catalog, categories] = await Promise.all([
    getCatalogProducts({
      search: params.search,
      categorySlug: params.categorySlug,
      tags: params.tags,
      sort: params.sort,
      page,
      limit: 12,
    }),
    getPublicCategories(),
  ]);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold text-[var(--neutral-950)]">Catalogo</h1>
        <p className="text-[var(--neutral-700)]">Busque, filtre e encontre a caneca ideal para o seu projeto.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-[var(--brand-100)] bg-white p-5">
          <h2 className="text-lg font-semibold text-[var(--neutral-900)]">Filtros</h2>
          <form className="mt-4 space-y-4" action="/catalogo" method="GET">
            <div>
              <label htmlFor="search" className="mb-1 block text-sm font-medium text-[var(--neutral-700)]">
                Busca
              </label>
              <input
                id="search"
                name="search"
                defaultValue={params.search}
                className="h-10 w-full rounded-xl border border-[var(--brand-200)] px-3 text-sm"
                placeholder="Nome, tag, descricao..."
              />
            </div>

            <div>
              <label htmlFor="categorySlug" className="mb-1 block text-sm font-medium text-[var(--neutral-700)]">
                Categoria
              </label>
              <select
                id="categorySlug"
                name="categorySlug"
                defaultValue={params.categorySlug ?? ''}
                className="h-10 w-full rounded-xl border border-[var(--brand-200)] px-3 text-sm"
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sort" className="mb-1 block text-sm font-medium text-[var(--neutral-700)]">
                Ordenacao
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={params.sort ?? 'newest'}
                className="h-10 w-full rounded-xl border border-[var(--brand-200)] px-3 text-sm"
              >
                <option value="newest">Mais recentes</option>
                <option value="featured">Destaques</option>
                <option value="name_asc">Nome A-Z</option>
                <option value="name_desc">Nome Z-A</option>
              </select>
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-full bg-[var(--brand-600)] text-sm font-semibold text-white transition hover:bg-[var(--brand-700)]"
            >
              Aplicar filtros
            </button>
            <Link
              href="/catalogo"
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--brand-200)] text-sm font-semibold text-[var(--brand-700)] transition hover:bg-[var(--brand-50)]"
            >
              Limpar filtros
            </Link>
          </form>
        </aside>

        <section className="space-y-5">
          <div className="text-sm text-[var(--neutral-600)]">{catalog.meta.total} produtos encontrados</div>
          <ProductGrid products={catalog.data} />
          <Pagination
            currentPage={catalog.meta.page}
            totalPages={catalog.meta.totalPages}
            buildHref={(newPage) =>
              buildPaginationHref(
                {
                  search: params.search,
                  categorySlug: params.categorySlug,
                  sort: params.sort,
                  tags: params.tags,
                },
                newPage,
              )
            }
          />
        </section>
      </div>
    </div>
  );
}

