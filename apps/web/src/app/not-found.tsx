import Link from 'next/link';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-[var(--brand-100)] bg-white p-10 text-center shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <h1 className="text-4xl font-semibold text-[var(--neutral-950)]">Pagina nao encontrada</h1>
      <p className="mt-3 text-[var(--neutral-700)]">
        O conteudo que voce tentou acessar nao existe ou foi movido.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-600)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)]"
      >
        Voltar ao inicio
      </Link>
    </div>
  );
}

