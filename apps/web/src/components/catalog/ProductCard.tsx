import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/features/products/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

function formatPrice(product: Product): string {
  if (product.priceMode === 'ON_REQUEST' || !product.basePriceCents) {
    return 'Sob orcamento';
  }

  const value = product.basePriceCents / 100;

  if (product.priceMode === 'FROM') {
    return `A partir de ${value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
  }

  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps): React.JSX.Element {
  const cover = product.images[0];

  return (
    <Card className="group overflow-hidden p-0">
      <Link href={`/produtos/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--brand-50)]">
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.altText}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--neutral-500)]">
              Sem imagem
            </div>
          )}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {product.tags.slice(0, 2).map((tag) => (
            <Badge key={tag.id}>{tag.name}</Badge>
          ))}
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--neutral-950)]">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-[var(--neutral-600)]">{product.shortDescription}</p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-[var(--brand-700)]">{formatPrice(product)}</span>
          <Link
            href={`/produtos/${product.slug}`}
            className="rounded-full border border-[var(--brand-200)] px-4 py-2 text-xs font-semibold text-[var(--brand-700)] transition hover:bg-[var(--brand-50)]"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </Card>
  );
}

