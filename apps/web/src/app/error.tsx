'use client';

import Link from 'next/link';

type ErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-10 text-center shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <h1 className="text-3xl font-semibold text-rose-700">Algo deu errado</h1>
      <p className="mt-3 text-sm text-[var(--neutral-700)]">{error.message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-600)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)]"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--brand-200)] px-6 text-sm font-semibold text-[var(--brand-700)] transition hover:bg-[var(--brand-50)]"
        >
          Inicio
        </Link>
      </div>
    </div>
  );
}

