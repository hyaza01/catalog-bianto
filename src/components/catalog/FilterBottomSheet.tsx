import { X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { CatalogFilters } from './CatalogFilters'
import { cn } from '../../utils/cn'

interface FilterBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  filterProps: ComponentProps<typeof CatalogFilters>
}

export const FilterBottomSheet = ({ isOpen, onClose, filterProps }: FilterBottomSheetProps) => {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-brand-text/60 transition-opacity duration-300 md:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <section
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 flex max-h-[80vh] flex-col rounded-t-3xl bg-brand-bg transition-transform duration-300 ease-out md:hidden',
          isOpen ? 'translate-y-0 shadow-2xl' : 'pointer-events-none translate-y-full',
        )}
        aria-label="Filtros mobile"
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
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-surface text-brand-primary transition hover:bg-[#C9B8A8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            aria-label="Fechar painel de filtros"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <CatalogFilters {...filterProps} />
        </div>

        <div className="shrink-0 border-t border-brand-surface bg-brand-bg p-4 pb-safe">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-brand-primary py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Aplicar Filtros
          </button>
        </div>
      </section>
    </>
  )
}
