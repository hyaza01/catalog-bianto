'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-client';
import { Input } from '@/components/ui/Input';

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export default function AdminCategoriesPage(): React.JSX.Element {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminFetch<Category[]>('/admin/categories'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string }) =>
      adminFetch('/admin/categories', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      setName('');
      void queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Falha ao criar categoria.');
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError(null);
    createMutation.mutate({ name });
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-semibold text-[var(--neutral-950)]">Categorias</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex gap-3 rounded-2xl border border-[var(--brand-100)] bg-white p-4">
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nova categoria" required />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-full bg-[var(--brand-600)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)] disabled:opacity-60"
        >
          Criar
        </button>
      </form>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-[var(--brand-100)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--brand-50)] text-[var(--neutral-700)]">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Ativa</th>
            </tr>
          </thead>
          <tbody>
            {categoriesQuery.data?.map((category) => (
              <tr key={category.id} className="border-t border-[var(--brand-100)]">
                <td className="px-4 py-3 font-medium text-[var(--neutral-900)]">{category.name}</td>
                <td className="px-4 py-3">{category.slug}</td>
                <td className="px-4 py-3">{category.isActive ? 'Sim' : 'Nao'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

