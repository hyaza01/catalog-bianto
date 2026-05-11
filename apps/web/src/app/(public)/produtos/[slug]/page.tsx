import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { ProductGallery } from '@/components/product/ProductGallery';
import { LeadForm } from '@/components/lead/LeadForm';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { getProductBySlug, getRelatedProducts } from '@/features/products/services/products.service';
import { buildMetadata } from '@/lib/seo';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;

  return buildMetadata({
    title: `Produto ${slug}`,
    canonicalPath: `/produtos/${slug}`,
  });
}

export default async function ProductPage({ params }: ProductPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;

  try {
    const [product, related] = await Promise.all([getProductBySlug(slug), getRelatedProducts(slug)]);

    const whatsappText = `Ola! Tenho interesse no produto ${product.name}. Vi no catalogo em /produtos/${product.slug}. Pode me enviar um orcamento?`;

    const productJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.shortDescription,
      image: product.images.map((image) => image.url),
      category: product.category.name,
      offers: {
        '@type': 'Offer',
        availability: product.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        priceCurrency: 'BRL',
        price: product.basePriceCents ? product.basePriceCents / 100 : undefined,
      },
    };

    return (
      <div className="space-y-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />

        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Catalogo', href: '/catalogo' },
            { label: product.category.name, href: `/categorias/${product.category.slug}` },
            { label: product.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <ProductGallery images={product.images} />

            <div className="space-y-4 rounded-2xl border border-[var(--brand-100)] bg-white p-6">
              <h1 className="text-3xl font-semibold text-[var(--neutral-950)]">{product.name}</h1>
              <p className="text-[var(--neutral-700)]">{product.shortDescription}</p>
              <p className="text-sm leading-relaxed text-[var(--neutral-700)]">{product.longDescription}</p>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-[var(--brand-50)] p-3 text-sm">
                  <span className="font-semibold">Quantidade minima:</span> {product.minQuantity}
                </div>
                <div className="rounded-xl bg-[var(--brand-50)] p-3 text-sm">
                  <span className="font-semibold">Disponibilidade:</span>{' '}
                  {product.isAvailable ? 'Disponivel' : 'Indisponivel'}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Atributos tecnicos</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {product.attributes.map((attribute) => (
                    <li key={attribute.id} className="rounded-xl border border-[var(--brand-100)] p-3 text-sm">
                      <span className="font-semibold">{attribute.label}:</span> {attribute.value}
                      {attribute.unit ? ` ${attribute.unit}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-2xl border border-[var(--brand-100)] bg-white p-6">
            <h2 className="text-xl font-semibold">Solicitar orcamento</h2>
            <p className="text-sm text-[var(--neutral-600)]">
              Envie os dados do seu projeto e receba atendimento comercial personalizado.
            </p>
            <LeadForm productId={product.id} source="produto" />
            <WhatsAppButton text={whatsappText} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700" />
          </aside>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Produtos relacionados</h2>
            <Link href="/catalogo" className="text-sm font-semibold text-[var(--brand-700)] hover:underline">
              Ver catalogo completo
            </Link>
          </div>
          <ProductGrid products={related} />
        </section>
      </div>
    );
  } catch {
    notFound();
  }
}

