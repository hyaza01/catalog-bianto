import { Product } from '@/features/products/types';
import { ProductCard } from './ProductCard';

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps): React.JSX.Element {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--brand-200)] bg-white p-8 text-center text-[var(--neutral-600)]">
        Nenhum produto encontrado para os filtros atuais.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

