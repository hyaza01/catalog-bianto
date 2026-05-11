'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-client';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

type SiteSetting = {
  key: string;
  value: Record<string, unknown>;
  isPublic: boolean;
};

export default function AdminSettingsPage(): React.JSX.Element {
  const queryClient = useQueryClient();
  const [key, setKey] = useState('store');
  const [isPublic, setIsPublic] = useState(true);
  const [jsonValue, setJsonValue] = useState('{\n  "name": "Bianto Store"\n}');
  const [error, setError] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminFetch<SiteSetting[]>('/admin/settings'),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { items: Array<{ key: string; value: Record<string, unknown>; isPublic: boolean }> }) =>
      adminFetch('/admin/settings', {
        method: 'PATCH',
        body: payload,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Falha ao atualizar configuracoes.');
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError(null);

    try {
      const parsed = JSON.parse(jsonValue) as Record<string, unknown>;
      updateMutation.mutate({
        items: [{ key, value: parsed, isPublic }],
      });
    } catch {
      setError('JSON invalido.');
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-semibold text-[var(--neutral-950)]">Configuracoes</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[var(--brand-100)] bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Chave</label>
          <Input value={key} onChange={(event) => setKey(event.target.value)} required />
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--neutral-700)]">
          <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
          Configuracao publica
        </label>
        <div>
          <label className="mb-1 block text-sm font-medium">Valor JSON</label>
          <Textarea value={jsonValue} onChange={(event) => setJsonValue(event.target.value)} className="min-h-48 font-mono" />
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="h-11 rounded-full bg-[var(--brand-600)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)] disabled:opacity-60"
        >
          {updateMutation.isPending ? 'Salvando...' : 'Salvar configuracao'}
        </button>
      </form>

      <section className="rounded-2xl border border-[var(--brand-100)] bg-white p-5">
        <h2 className="text-lg font-semibold">Configuracoes cadastradas</h2>
        <pre className="mt-3 overflow-auto rounded-xl bg-[var(--neutral-50)] p-4 text-xs">
          {settingsQuery.isLoading
            ? 'Carregando...'
            : settingsQuery.error
              ? (settingsQuery.error as Error).message
              : JSON.stringify(settingsQuery.data, null, 2)}
        </pre>
      </section>
    </div>
  );
}

