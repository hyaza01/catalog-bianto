'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin-client';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

type Product = {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  minQuantity: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
};

export default function EditProductPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Product | null>(null);

  const productQuery = useQuery({
    queryKey: ['admin-product', params.id],
    queryFn: () => adminFetch<Product>(`/admin/products/${params.id}`),
  });

  useEffect(() => {
    if (productQuery.data) {
      setForm(productQuery.data);
    }
  }, [productQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Product>) =>
      adminFetch(`/admin/products/${params.id}`, {
        method: 'PATCH',
        body: payload,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-product', params.id] });
      router.push('/admin/produtos');
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Falha ao atualizar.');
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!form) return;

    updateMutation.mutate({
      name: form.name,
      shortDescription: form.shortDescription,
      longDescription: form.longDescription,
      minQuantity: form.minQuantity,
      status: form.status,
    });
  };

  if (productQuery.isLoading || !form) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-semibold text-[var(--neutral-950)]">Editar produto</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[var(--brand-100)] bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Nome</label>
          <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Descricao curta</label>
          <Input
            value={form.shortDescription}
            onChange={(event) => setForm({ ...form, shortDescription: event.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Descricao longa</label>
          <Textarea
            value={form.longDescription}
            onChange={(event) => setForm({ ...form, longDescription: event.target.value })}
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Quantidade minima</label>
            <Input
              type="number"
              min={1}
              value={form.minQuantity}
              onChange={(event) => setForm({ ...form, minQuantity: Number(event.target.value) })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as Product['status'] })}
              className="h-11 w-full rounded-xl border border-[var(--brand-200)] px-3 text-sm"
            >
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </div>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="h-11 rounded-full bg-[var(--brand-600)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)] disabled:opacity-60"
        >
          {updateMutation.isPending ? 'Salvando...' : 'Salvar alteracoes'}
        </button>
      </form>
    </div>
  );
}

