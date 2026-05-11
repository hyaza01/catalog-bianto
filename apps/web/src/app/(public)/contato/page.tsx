import { LeadForm } from '@/components/lead/LeadForm';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Contato e orcamento',
  description: 'Fale com a Bianto Store e receba um orcamento personalizado.',
  canonicalPath: '/contato',
});

export default function ContactPage(): React.JSX.Element {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold text-[var(--neutral-950)]">Contato e orcamento</h1>
        <p className="text-[var(--neutral-700)]">
          Preencha os dados abaixo para receber uma proposta comercial personalizada para sua demanda.
        </p>
        <div className="rounded-2xl border border-[var(--brand-100)] bg-white p-5 text-sm text-[var(--neutral-700)]">
          Atendimento de segunda a sexta, com retorno rapido via WhatsApp.
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--brand-100)] bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
        <LeadForm source="contato" />
      </div>
    </div>
  );
}

