import { X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CatalogFilters } from './CatalogFilters'
import { overlayVariants, bottomSheetVariants } from '../../utils/animations'

interface FilterBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  filterProps: ComponentProps<typeof CatalogFilters>
}

export const FilterBottomSheet = ({ isOpen, onClose, filterProps }: FilterBottomSheetProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-brand-text/60 md:hidden"
            onClick={onClose}
            aria-hidden="true"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          <motion.section
            className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[80vh] flex-col rounded-t-3xl bg-brand-bg shadow-2xl md:hidden"
            aria-label="Filtros mobile"
            variants={bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Handle Visual */}
            <div className="flex w-full justify-center pt-3 pb-1" aria-hidden="true">
              <div className="h-1.5 w-12 rounded-full bg-brand-muted" />
            </div>

            <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-2">
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-2xl font-bold text-brand-text">Filtros</h2>
                {filterProps.hasActiveFilters && (
                  <button
                    type="button"
                    onClick={filterProps.onClearFilters}
                    className="text-xs font-semibold text-brand-primary underline hover:text-brand-primary2"
                  >
                    Limpar tudo
                  </button>
                )}
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-surface text-brand-primary transition hover:bg-[#C9B8A8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                aria-label="Fechar painel de filtros"
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} aria-hidden="true" />
              </motion.button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <CatalogFilters {...filterProps} />
            </div>

            <div className="shrink-0 border-t border-brand-surface bg-brand-bg p-4 pb-safe">
              <motion.button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-brand-primary py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Aplicar Filtros
              </motion.button>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  )
}
