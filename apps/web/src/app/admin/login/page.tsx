'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import env from '@/config/env';
import { Input } from '@/components/ui/Input';

export default function AdminLoginPage(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${env.apiUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string | string[] };
        const message = Array.isArray(payload.message)
          ? payload.message.join(', ')
          : payload.message ?? 'Falha no login';
        throw new Error(message);
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-[var(--brand-100)] bg-white p-8 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <h1 className="text-3xl font-semibold text-[var(--neutral-950)]">Login administrativo</h1>
      <p className="mt-2 text-sm text-[var(--neutral-600)]">Acesse o painel seguro da Bianto Store.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--neutral-700)]">E-mail</label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="admin@bianto.local"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--neutral-700)]">Senha</label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="********"
          />
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-full bg-[var(--brand-600)] text-sm font-semibold text-white transition hover:bg-[var(--brand-700)] disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

