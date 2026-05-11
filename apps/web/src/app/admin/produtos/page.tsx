'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-client';

type AdminProductsResponse = {
  data: Array<{
    id: string;
    name: string;
    status: string;
    isFeatured: boolean;
    isAvailable: boolean;
    category: { name: string };
  }>;
  meta: {
    page: number;
    totalPages: number;
  };
};

export default function AdminProductsPage(): React.JSX.Element {
  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminFetch<AdminProductsResponse>('/admin/products?page=1&limit=50'),
  });

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--neutral-950)]">Produtos</h1>
          <p className="mt-1 text-sm text-[var(--neutral-600)]">Gestao de produtos do catalogo.</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-600)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)]"
        >
          Novo produto
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl border border-[var(--brand-100)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--brand-50)] text-[var(--neutral-700)]">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {productsQuery.isLoading ? (
              <tr>
                <td className="px-4 py-4" colSpan={4}>
                  Carregando...
                </td>
              </tr>
            ) : null}
            {productsQuery.error ? (
              <tr>
                <td className="px-4 py-4 text-rose-600" colSpan={4}>
                  {(productsQuery.error as Error).message}
                </td>
              </tr>
            ) : null}
            {productsQuery.data?.data.map((product) => (
              <tr key={product.id} className="border-t border-[var(--brand-100)]">
                <td className="px-4 py-3 font-medium text-[var(--neutral-900)]">{product.name}</td>
                <td className="px-4 py-3">{product.category.name}</td>
                <td className="px-4 py-3">{product.status}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/produtos/${product.id}/editar`} className="text-[var(--brand-700)] hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

