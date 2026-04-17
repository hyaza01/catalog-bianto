import { Eye, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CATEGORY_LABELS, type Product } from '../../types/product'
import { formatBRL } from '../../utils/format'
import { cn } from '../../utils/cn'
import { ProductImage } from '../common/ProductImage'

interface ProductCardProps {
  product: Product
  onOpenDetails: (product: Product) => void
  onSelect: (product: Product) => void
  variant?: 'grid' | 'carousel'
}

const readOptionalOldPrice = (product: Product): number | null => {
  const productLike = product as Product & {
    oldPrice?: unknown
    metadata?: {
      old_price?: unknown
    }
  }
  const metadata = productLike.metadata ?? {}

  const readNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    return null
  }

  return readNumber(productLike.oldPrice) ?? readNumber(metadata.old_price)
}

export const ProductCard = ({ product, onOpenDetails, onSelect }: ProductCardProps) => {
  const [isSelecting, setIsSelecting] = useState(false)
  const categoryLabel = product.categoryName?.trim() || CATEGORY_LABELS[product.category]
  const shortDescription =
    product.description.short.trim() || product.description.long.trim() || 'Produto personalizado sob encomenda.'
  const oldPrice = readOptionalOldPrice(product)
  const validOldPrice = typeof oldPrice === 'number' && oldPrice > product.price ? oldPrice : null
  const isUnavailable = !product.flags.isAvailable

  useEffect(() => {
    if (!isSelecting) {
      return
    }

    const timer = window.setTimeout(() => {
      setIsSelecting(false)
    }, 550)

    return () => {
      window.clearTimeout(timer)
    }
  }, [isSelecting])

  const handleSelect = () => {
    onSelect(product)
    setIsSelecting(true)
  }

  return (
    <article
      className={cn(
        'group flex h-full w-full max-w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-brand-surface/80 bg-white shadow-sm transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-lg hover:border-brand-primary/20',
        isUnavailable && 'opacity-65',
      )}
    >
      <div className="flex h-full min-w-0 flex-col">
        <button
          type="button"
          onClick={() => onOpenDetails(product)}
          aria-label={`Abrir detalhes de ${product.name}`}
          className="relative block w-full min-w-0 overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          <div className="w-full aspect-square border-b border-brand-surface/60 bg-brand-bg">
            <ProductImage
              src={product.images[0]}
              alt={`Imagem do produto ${product.name}`}
              loading="lazy"
              className="h-full w-full"
              imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {isUnavailable && (
            <span className="pointer-events-none absolute left-2 top-2 inline-flex rounded-full bg-brand-text/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm sm:left-3 sm:top-3">
              Indisponível
            </span>
          )}

          {product.flags.isFeatured && !isUnavailable && (
            <span className="pointer-events-none absolute right-2 top-2 inline-flex rounded-full bg-brand-accent/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:right-3 sm:top-3">
              ★ Destaque
            </span>
          )}
        </button>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 p-2.5 md:gap-2.5 md:p-3.5">
          <div className="min-w-0 hidden sm:block">
            <span className="inline-flex max-w-full rounded-full border border-brand-muted/50 bg-brand-bg px-2 py-0.5 text-[10px] font-medium text-brand-primary sm:px-2.5 sm:py-1">
              <span className="max-w-full break-words whitespace-normal leading-tight">{categoryLabel}</span>
            </span>
          </div>

          <div className="min-w-0 space-y-1 md:space-y-1.5">
            <button
              type="button"
              onClick={() => onOpenDetails(product)}
              aria-label={`Ver detalhes de ${product.name}`}
              className="w-full min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              <h3 className="font-sans text-xs font-bold leading-tight text-brand-text [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden md:text-sm">
                {product.name}
              </h3>
            </button>

            <p className="hidden md:-webkit-box md:[-webkit-box-orient:vertical] md:[-webkit-line-clamp:2] text-[12px] leading-relaxed text-brand-primary/80 overflow-hidden">
              {shortDescription}
            </p>
          </div>

          <div className="mt-auto space-y-0.5">
            {validOldPrice && <p className="text-[10px] leading-none text-brand-muted line-through md:text-xs">{formatBRL(validOldPrice)}</p>}
            <p className="text-sm font-bold leading-tight text-brand-text md:text-lg">{formatBRL(product.price)}</p>
          </div>

          <div className="flex flex-row items-center gap-1.5 md:grid md:grid-cols-[44px_minmax(0,1fr)] md:gap-2 mt-1">
            <button
              type="button"
              onClick={() => onOpenDetails(product)}
              aria-label={`Ver detalhes de ${product.name}`}
              className="inline-flex h-8 w-8 min-h-8 shrink-0 items-center justify-center rounded-lg border border-brand-muted/50 bg-brand-bg text-brand-primary transition-all duration-200 hover:bg-brand-surface hover:border-brand-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary md:h-11 md:w-11 md:min-h-11 md:rounded-xl"
            >
              <Eye size={16} aria-hidden="true" className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <button
              type="button"
              onClick={handleSelect}
              disabled={isUnavailable}
              aria-label={`Selecionar ${product.name}`}
              className={cn(
                'inline-flex h-8 min-h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-primary pl-1 pr-2 text-[11px] font-semibold text-white transition-all duration-200 hover:bg-brand-primary2 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:bg-brand-primary/35 md:h-11 md:min-h-11 md:rounded-xl md:px-3 md:text-sm',
                isSelecting && 'animate-[pulse_500ms_ease-out] ring-2 ring-brand-primary/35',
              )}
            >
              <ShoppingBag size={15} aria-hidden="true" />
              <span className="truncate">{isUnavailable ? 'Indisponível' : isSelecting ? 'Adicionado ✓' : 'Selecionar'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
