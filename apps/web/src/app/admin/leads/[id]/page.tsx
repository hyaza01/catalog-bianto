'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { adminFetch } from '@/lib/admin-client';
import { Textarea } from '@/components/ui/Textarea';

type LeadDetail = {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'CONVERTED' | 'LOST' | 'SPAM';
  message?: string;
  internalNotes?: string;
  products: Array<{ id: string; product: { name: string } }>;
};

export default function AdminLeadDetailPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LeadDetail['status']>('NEW');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const leadQuery = useQuery({
    queryKey: ['admin-lead', params.id],
    queryFn: () => adminFetch<LeadDetail>(`/admin/leads/${params.id}`),
  });

  useMemo(() => {
    if (leadQuery.data) {
      setStatus(leadQuery.data.status);
      setNotes(leadQuery.data.internalNotes ?? '');
    }
    return null;
  }, [leadQuery.data]);

  const statusMutation = useMutation({
    mutationFn: (newStatus: LeadDetail['status']) =>
      adminFetch(`/admin/leads/${params.id}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-lead', params.id] });
      void queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Falha ao atualizar status.');
    },
  });

  const notesMutation = useMutation({
    mutationFn: (newNotes: string) =>
      adminFetch(`/admin/leads/${params.id}/notes`, {
        method: 'PATCH',
        body: { internalNotes: newNotes },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-lead', params.id] });
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Falha ao salvar observacoes.');
    },
  });

  const handleNotesSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    notesMutation.mutate(notes);
  };

  if (leadQuery.isLoading || !leadQuery.data) {
    return <div>Carregando...</div>;
  }

  const lead = leadQuery.data;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-semibold text-[var(--neutral-950)]">Detalhe do lead</h1>
      </header>

      <section className="rounded-2xl border border-[var(--brand-100)] bg-white p-6">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[var(--neutral-900)]">Nome</dt>
            <dd>{lead.name}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--neutral-900)]">WhatsApp</dt>
            <dd>{lead.whatsapp}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--neutral-900)]">E-mail</dt>
            <dd>{lead.email ?? '-'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--neutral-900)]">Produto</dt>
            <dd>{lead.products.map((item) => item.product.name).join(', ') || '-'}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-[var(--brand-100)] bg-white p-6">
        <h2 className="text-lg font-semibold">Status</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as LeadDetail['status'])}
            className="h-11 rounded-xl border border-[var(--brand-200)] px-3 text-sm"
          >
            <option value="NEW">Novo</option>
            <option value="IN_PROGRESS">Em atendimento</option>
            <option value="CONVERTED">Convertido</option>
            <option value="LOST">Perdido</option>
            <option value="SPAM">Spam</option>
          </select>
          <button
            type="button"
            onClick={() => statusMutation.mutate(status)}
            className="h-11 rounded-full bg-[var(--brand-600)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)]"
          >
            Atualizar status
          </button>
          <a
            href={`https://wa.me/${lead.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Abrir WhatsApp
          </a>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--brand-100)] bg-white p-6">
        <h2 className="text-lg font-semibold">Observacoes internas</h2>
        <form className="mt-3 space-y-3" onSubmit={handleNotesSubmit}>
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          <button
            type="submit"
            className="h-11 rounded-full border border-[var(--brand-200)] px-5 text-sm font-semibold text-[var(--brand-700)] transition hover:bg-[var(--brand-50)]"
          >
            Salvar observacoes
          </button>
        </form>
      </section>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

