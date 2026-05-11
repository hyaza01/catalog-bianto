'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-client';

type LeadListResponse = {
  data: Array<{
    id: string;
    name: string;
    whatsapp: string;
    status: string;
    createdAt: string;
  }>;
};

export default function AdminLeadsPage(): React.JSX.Element {
  const leadsQuery = useQuery({
    queryKey: ['admin-leads'],
    queryFn: () => adminFetch<LeadListResponse>('/admin/leads?page=1&limit=100'),
  });

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-semibold text-[var(--neutral-950)]">Leads</h1>
      </header>

      <div className="overflow-hidden rounded-2xl border border-[var(--brand-100)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--brand-50)] text-[var(--neutral-700)]">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {leadsQuery.isLoading ? (
              <tr>
                <td className="px-4 py-4" colSpan={4}>
                  Carregando...
                </td>
              </tr>
            ) : null}
            {leadsQuery.error ? (
              <tr>
                <td className="px-4 py-4 text-rose-600" colSpan={4}>
                  {(leadsQuery.error as Error).message}
                </td>
              </tr>
            ) : null}
            {leadsQuery.data?.data.map((lead) => (
              <tr key={lead.id} className="border-t border-[var(--brand-100)]">
                <td className="px-4 py-3 font-medium text-[var(--neutral-900)]">{lead.name}</td>
                <td className="px-4 py-3">{lead.whatsapp}</td>
                <td className="px-4 py-3">{lead.status}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="text-[var(--brand-700)] hover:underline">
                    Ver detalhe
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

