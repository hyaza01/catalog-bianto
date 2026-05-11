'use client';

import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-client';

export default function AdminDashboardPage(): React.JSX.Element {
  const summaryQuery = useQuery({
    queryKey: ['admin-dashboard-summary'],
    queryFn: () => adminFetch<Record<string, unknown>>('/admin/dashboard/summary'),
  });

  const recentLeadsQuery = useQuery({
    queryKey: ['admin-dashboard-recent-leads'],
    queryFn: () => adminFetch<Array<{ id: string; name: string; status: string; createdAt: string }>>('/admin/dashboard/recent-leads'),
  });

  const topProductsQuery = useQuery({
    queryKey: ['admin-dashboard-top-products'],
    queryFn: () => adminFetch<Array<{ id: string; name: string; _count: { leadProducts: number } }>>('/admin/dashboard/top-products'),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-[var(--neutral-950)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--neutral-600)]">Resumo comercial e operacional do catalogo.</p>
      </header>

      <section className="rounded-2xl border border-[var(--brand-100)] bg-white p-5">
        <h2 className="text-lg font-semibold">Resumo</h2>
        <pre className="mt-3 overflow-auto rounded-xl bg-[var(--neutral-50)] p-4 text-xs">
          {summaryQuery.isLoading
            ? 'Carregando...'
            : summaryQuery.error
              ? (summaryQuery.error as Error).message
              : JSON.stringify(summaryQuery.data, null, 2)}
        </pre>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--brand-100)] bg-white p-5">
          <h2 className="text-lg font-semibold">Leads recentes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {recentLeadsQuery.isLoading ? <li>Carregando...</li> : null}
            {recentLeadsQuery.error ? <li className="text-rose-600">Falha ao carregar.</li> : null}
            {recentLeadsQuery.data?.map((lead) => (
              <li key={lead.id} className="rounded-xl border border-[var(--brand-100)] p-3">
                <div className="font-semibold text-[var(--neutral-900)]">{lead.name}</div>
                <div className="text-xs text-[var(--neutral-600)]">{lead.status}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[var(--brand-100)] bg-white p-5">
          <h2 className="text-lg font-semibold">Produtos mais consultados</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {topProductsQuery.isLoading ? <li>Carregando...</li> : null}
            {topProductsQuery.error ? <li className="text-rose-600">Falha ao carregar.</li> : null}
            {topProductsQuery.data?.map((product) => (
              <li key={product.id} className="rounded-xl border border-[var(--brand-100)] p-3">
                <div className="font-semibold text-[var(--neutral-900)]">{product.name}</div>
                <div className="text-xs text-[var(--neutral-600)]">Leads: {product._count.leadProducts}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

