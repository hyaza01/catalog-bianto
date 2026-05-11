import Link from 'next/link';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Badge } from '@/components/ui/Badge';
import { getPublicCategories } from '@/features/categories/services/categories.service';
import { getFeaturedProducts } from '@/features/products/services/products.service';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Canecas personalizadas sob encomenda',
  description:
    'Catalogo digital Bianto Store para orcamento de canecas personalizadas, brindes corporativos e presentes especiais.',
  canonicalPath: '/',
});

export const dynamic = 'force-dynamic';

export default async function HomePage(): Promise<React.JSX.Element> {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getPublicCategories(),
  ]);

  return (
    <div className="space-y-20 pb-10">
      <section className="grid gap-10 pt-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <Badge>Catalogo digital para orcamentos rapidos</Badge>
          <h1 className="text-4xl font-semibold leading-tight text-[var(--neutral-950)] sm:text-5xl">
            Canecas personalizadas com visual premium para vender mais.
          </h1>
          <p className="max-w-xl text-base text-[var(--neutral-700)] sm:text-lg">
            A Bianto Store transforma ideias em produtos personalizados com acabamento profissional para empresas,
            eventos e presentes. Explore o catalogo e envie seu briefing em minutos.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-600)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)]"
            >
              Ver catalogo
            </Link>
            <Link
              href="/contato"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--brand-200)] bg-white px-6 text-sm font-semibold text-[var(--brand-700)] transition hover:bg-[var(--brand-50)]"
            >
              Solicitar orcamento
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--brand-100)] bg-gradient-to-br from-white to-[var(--brand-50)] p-8 shadow-[0_20px_50px_rgba(251,146,60,0.18)]">
          <h2 className="text-2xl font-semibold text-[var(--neutral-900)]">Como funciona</h2>
          <ol className="mt-5 space-y-4 text-sm text-[var(--neutral-700)]">
            <li>1. Escolha a caneca ideal para o seu objetivo.</li>
            <li>2. Informe quantidade, prazo e personalizacao.</li>
            <li>3. Receba atendimento comercial via WhatsApp.</li>
          </ol>
          <p className="mt-5 rounded-xl bg-white/80 p-4 text-sm text-[var(--neutral-600)]">
            Atendimento dedicado para pequenos e grandes volumes com orientacao de arte e prazo de producao.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-[var(--neutral-950)]">Produtos em destaque</h2>
          <Link href="/catalogo" className="text-sm font-semibold text-[var(--brand-700)] hover:underline">
            Ver todos
          </Link>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>

      <section className="space-y-5">
        <h2 className="text-3xl font-semibold text-[var(--neutral-950)]">Categorias</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categorias/${category.slug}`}
              className="rounded-2xl border border-[var(--brand-100)] bg-white p-5 transition hover:border-[var(--brand-300)] hover:shadow-[0_14px_28px_rgba(251,146,60,0.15)]"
            >
              <h3 className="text-lg font-semibold text-[var(--neutral-900)]">{category.name}</h3>
              <p className="mt-2 text-sm text-[var(--neutral-600)]">Explore modelos e solicite seu orcamento.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--brand-100)] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <h2 className="text-3xl font-semibold text-[var(--neutral-950)]">Pronto para personalizar?</h2>
        <p className="mt-3 max-w-2xl text-[var(--neutral-700)]">
          Envie suas ideias, quantidade e prazo. Nossa equipe comercial retorna com uma proposta personalizada para
          o seu projeto.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/contato"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-600)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)]"
          >
            Falar com atendimento
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--brand-200)] px-6 text-sm font-semibold text-[var(--brand-700)] transition hover:bg-[var(--brand-50)]"
          >
            Voltar ao catalogo
          </Link>
        </div>
      </section>
    </div>
  );
}

