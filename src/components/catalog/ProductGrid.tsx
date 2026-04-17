import { AnimatePresence, motion } from 'framer-motion'
import type { Product } from '../../types/product'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  onOpenDetails: (product: Product) => void
  onSelect: (product: Product) => void
}

export const ProductGrid = ({ products, onOpenDetails, onSelect }: ProductGridProps) => {
  return (
    <AnimatePresence mode="wait">
      {products.length === 0 ? (
        <motion.div
          key="empty-products"
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-dashed border-brand-surface bg-brand-bg/50 p-10 text-center"
        >
          <p className="font-display text-xl text-brand-text">Nenhum produto encontrado</p>
          <p className="mt-2 text-sm text-brand-primary">Ajuste os filtros para encontrar outras opções no catálogo.</p>
        </motion.div>
      ) : (
        <motion.div key="products-grid-wrapper" layout className="overflow-x-hidden rounded-2xl bg-brand-bg/30 p-1.5 sm:p-2">
          <motion.div
            key="products-grid"
            layout
            className="grid grid-cols-2 items-stretch gap-2 [grid-auto-rows:1fr] sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4"
          >
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  className="h-full min-w-0"
                  initial={{ opacity: 0, y: 22, scale: 0.98, filter: 'blur(6px)' }}
                  whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  viewport={{ once: false, amount: 0.2 }}
                  exit={{ opacity: 0, y: -16, scale: 0.97, filter: 'blur(4px)' }}
                  transition={{
                    duration: 0.38,
                    delay: Math.min(index * 0.05, 0.25),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <ProductCard product={product} onOpenDetails={onOpenDetails} onSelect={onSelect} variant="grid" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
