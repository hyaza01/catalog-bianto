import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import type { Product } from '../../types/product'
import { ProductCard } from './ProductCard'
import { SkeletonCard } from '../SkeletonCard'
import { staggerContainer, fadeUp } from '../../lib/motionVariants'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  onOpenDetails: (product: Product) => void
  onSelect: (product: Product) => void
}

export const ProductGrid = ({ products, isLoading, onOpenDetails, onSelect }: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 items-stretch gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4 p-1.5 sm:p-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {products.length === 0 ? (
        <motion.div
          key="empty-products"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring' }}
          className="rounded-2xl border border-dashed border-brand-surface bg-brand-bg/50 p-10 text-center py-16"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Search className="w-12 h-12 text-stone-300 mx-auto" />
          </motion.div>
          <p className="font-display text-xl text-brand-text mt-4">Nenhum produto encontrado</p>
          <p className="mt-2 text-sm text-brand-primary">Ajuste os filtros para encontrar outras opções no catálogo.</p>
        </motion.div>
      ) : (
        <motion.div key="products-grid-wrapper" layout className="overflow-x-hidden rounded-2xl bg-brand-bg/30 p-1.5 sm:p-2">
          <motion.ul
            key="products-grid"
            layout
            variants={staggerContainer(0.08, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 items-stretch gap-2 [grid-auto-rows:1fr] sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4"
          >
            <AnimatePresence>
              {products.map((product) => (
                <motion.li
                  key={product.id}
                  layout
                  layoutId={`product-${product.id}`}
                  className="h-full min-w-0 list-none"
                  variants={fadeUp}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} onOpenDetails={onOpenDetails} onSelect={onSelect} variant="grid" />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
