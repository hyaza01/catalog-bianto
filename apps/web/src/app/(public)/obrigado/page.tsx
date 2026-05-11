import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Obrigado pelo contato',
  description: 'Recebemos seu lead e retornaremos em breve.',
  canonicalPath: '/obrigado',
});

export default function ThankYouPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-[var(--brand-100)] bg-white p-10 text-center shadow-[0_20px_40px_rgba(251,146,60,0.12)]">
      <h1 className="text-4xl font-semibold text-[var(--neutral-950)]">Obrigado!</h1>
      <p className="mt-3 text-[var(--neutral-700)]">
        Seu pedido de orcamento foi enviado com sucesso. Em breve nossa equipe comercial entrara em contato.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/catalogo"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-600)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)]"
        >
          Voltar ao catalogo
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--brand-200)] px-6 text-sm font-semibold text-[var(--brand-700)] transition hover:bg-[var(--brand-50)]"
        >
          Ir para inicio
        </Link>
      </div>
    </div>
  );
}

