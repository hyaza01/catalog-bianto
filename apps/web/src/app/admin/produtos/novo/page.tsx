'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin-client';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

type Category = { id: string; name: string };

export default function NewProductPage(): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories-basic'],
    queryFn: () => adminFetch<Category[]>('/admin/categories'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      adminFetch('/admin/products', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      router.push('/admin/produtos');
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Falha ao criar produto.');
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    const payload = {
      name: String(formData.get('name') ?? ''),
      shortDescription: String(formData.get('shortDescription') ?? ''),
      longDescription: String(formData.get('longDescription') ?? ''),
      categoryId: String(formData.get('categoryId') ?? ''),
      minQuantity: Number(formData.get('minQuantity') ?? 1),
      status: String(formData.get('status') ?? 'DRAFT'),
      priceMode: String(formData.get('priceMode') ?? 'ON_REQUEST'),
      isAvailable: true,
      isFeatured: false,
      isCustomizable: true,
      images: [
        {
          url: String(formData.get('imageUrl') ?? ''),
          altText: String(formData.get('imageAlt') ?? ''),
          isCover: true,
          sortOrder: 0,
        },
      ],
      tags: [],
      attributes: [],
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-semibold text-[var(--neutral-950)]">Novo produto</h1>
        <p className="mt-1 text-sm text-[var(--neutral-600)]">Cadastre um novo produto para o catalogo.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[var(--brand-100)] bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <Input name="name" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Categoria</label>
            <select
              name="categoryId"
              required
              className="h-11 w-full rounded-xl border border-[var(--brand-200)] px-3 text-sm"
            >
              <option value="">Selecione</option>
              {categoriesQuery.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Descricao curta</label>
          <Input name="shortDescription" required />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Descricao longa</label>
          <Textarea name="longDescription" required />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Quantidade minima</label>
            <Input name="minQuantity" type="number" min={1} defaultValue={10} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select name="status" className="h-11 w-full rounded-xl border border-[var(--brand-200)] px-3 text-sm">
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Publicado</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Preco</label>
            <select name="priceMode" className="h-11 w-full rounded-xl border border-[var(--brand-200)] px-3 text-sm">
              <option value="ON_REQUEST">Sob orcamento</option>
              <option value="FROM">A partir de</option>
              <option value="FIXED">Fixo</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">URL da imagem principal</label>
            <Input name="imageUrl" type="url" required placeholder="https://..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Alt text da imagem</label>
            <Input name="imageAlt" required />
          </div>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="h-11 rounded-full bg-[var(--brand-600)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)] disabled:opacity-60"
        >
          {createMutation.isPending ? 'Salvando...' : 'Salvar produto'}
        </button>
      </form>
    </div>
  );
}

