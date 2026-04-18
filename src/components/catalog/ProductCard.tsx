import { Eye, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useReducedMotion } from 'framer-motion'
import { CATEGORY_LABELS, type Product } from '../../types/product'
import { formatBRL } from '../../utils/format'
import { cn } from '../../utils/cn'
import { ProductImage } from '../common/ProductImage'
import { useRipple } from '../../hooks/useRipple'

interface ProductCardProps {
  product: Product
  onOpenDetails: (product: Product) => void
  onSelect: (product: Product) => void
  variant?: 'grid' | 'carousel'
  index?: number
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

export const ProductCard = ({ product, onOpenDetails, onSelect, index = 0 }: ProductCardProps) => {
  const [isSelecting, setIsSelecting] = useState(false)
  const shouldReduce = useReducedMotion()
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const tiltEnabled = !shouldReduce && !isMobile

  // Framer Motion 3D tilt
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-0.5, 0.5], tiltEnabled ? [6, -6] : [0, 0])
  const rotateY = useTransform(x, [-0.5, 0.5], tiltEnabled ? [-6, 6] : [0, 0])
  const imgX = useTransform(x, [-0.5, 0.5], tiltEnabled ? ['-8px', '8px'] : ['0px', '0px'])
  const imgY = useTransform(y, [-0.5, 0.5], tiltEnabled ? ['-8px', '8px'] : ['0px', '0px'])

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (!tiltEnabled) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }

  function onMouseLeave() {
    x.set(0)
    y.set(0)
  }

  const createRipple = useRipple()
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
    <motion.article
      layoutId={`product-card-${product.id}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 700 }}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      whileHover={tiltEnabled ? { scale: 1.02 } : undefined}
      className={cn(
        'group flex h-full w-full max-w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E8DDD4] bg-[#FDFCFB] shadow-[0_2px_8px_rgba(43,43,43,0.08)] glow-hover',
        isUnavailable && 'opacity-70',
      )}
    >
      {/* Mídia com proporção controlada por variante para evitar recortes/alturas inconsistentes. */}
      <div className="flex h-full min-w-0 flex-col">
        <button
          type="button"
          onClick={() => onOpenDetails(product)}
          aria-label={`Abrir detalhes de ${product.name}`}
          className="relative block w-full min-w-0 overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F6F5A]"
        >
          <div className="w-full aspect-square border-b border-[#E8DDD4] bg-[#EDE6DE] overflow-hidden">
            <motion.div style={tiltEnabled ? { x: imgX, y: imgY, scale: 1.15 } : undefined} className="h-full w-full">
              <ProductImage
                src={product.images[0]}
                alt={`Imagem do produto ${product.name}`}
                loading="lazy"
                className={cn('h-full w-full', index % 2 === 0 ? 'product-float' : 'product-float-even')}
                imgClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </motion.div>
          </div>

          {isUnavailable && (
            <span className="pointer-events-none absolute left-2 top-2 inline-flex rounded-full bg-[#5F6F5A] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white sm:left-3 sm:top-3 sm:py-1">
              Indisponivel
            </span>
          )}
        </button>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 p-2 md:gap-3 md:p-3">
          <div className="min-w-0 hidden sm:block">
            <span className="inline-flex max-w-full rounded-[4px] border border-[#A9B8A3] bg-[#EDE6DE] px-1.5 py-0.5 text-[10px] font-medium text-[#5F6F5A] sm:rounded-full sm:px-2 sm:py-1">
              <span className="max-w-full break-words whitespace-normal leading-tight">{categoryLabel}</span>
            </span>
          </div>

          <div className="min-w-0 space-y-1 md:space-y-1.5">
            <button
              type="button"
              onClick={() => onOpenDetails(product)}
              aria-label={`Ver detalhes de ${product.name}`}
              className="w-full min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F6F5A]"
            >
              <h3 className="font-sans text-xs font-bold leading-tight text-[#2B2B2B] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden md:text-sm">
                {product.name}
              </h3>
            </button>

            <p className="hidden md:-webkit-box md:[-webkit-box-orient:vertical] md:[-webkit-line-clamp:2] text-[12px] leading-relaxed text-[#5F6F5A] overflow-hidden">
              {shortDescription}
            </p>
          </div>

          <div className="mt-auto space-y-0.5">
            {validOldPrice && <p className="text-[10px] leading-none text-[#A9B8A3] line-through md:text-xs">{formatBRL(validOldPrice)}</p>}
            <p className="text-sm font-bold leading-tight text-[#2B2B2B] md:text-lg price-shimmer">{formatBRL(product.price)}</p>
          </div>

          {/* CTAs responsivos: olho fixo e selecionar flexível sem ultrapassar o card. */}
          <div className="flex flex-row items-center gap-1 md:grid md:grid-cols-[44px_minmax(0,1fr)] md:gap-2 mt-1">
            <button
              type="button"
              onClick={() => onOpenDetails(product)}
              aria-label={`Ver detalhes de ${product.name}`}
              className="inline-flex h-8 w-8 min-h-8 shrink-0 items-center justify-center rounded-lg border border-[#A9B8A3] bg-[#EDE6DE] text-[#5F6F5A] transition-all duration-300 hover:bg-[#D8C8B8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F6F5A] md:h-11 md:w-11 md:min-h-11 md:rounded-xl"
            >
              <Eye size={16} aria-hidden="true" className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                handleSelect()
                createRipple(e)
              }}
              disabled={isUnavailable}
              aria-label={`Selecionar ${product.name}`}
              className={cn(
                'ripple-btn inline-flex h-8 min-h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#5F6F5A] pl-1 pr-2 text-[11px] font-semibold text-white transition-all duration-300 hover:bg-[#7A8F73] hover:shadow-lg hover:shadow-[#5F6F5A]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F6F5A] disabled:cursor-not-allowed disabled:bg-[#5F6F5A]/45 md:h-11 md:min-h-11 md:rounded-xl md:px-3 md:text-sm',
                isSelecting && 'ring-2 ring-[#5F6F5A]/35',
              )}
            >
              <ShoppingBag size={15} aria-hidden="true" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={isUnavailable ? 'unavailable' : isSelecting ? 'selected' : 'default'}
                  className="truncate"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isUnavailable ? 'Indisponivel' : isSelecting ? 'Selecionado' : 'Selecionar'}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
