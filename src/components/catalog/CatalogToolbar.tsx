import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { AnimatedCounter } from '../AnimatedCounter'

interface CatalogToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  resultCount: number
  hasActiveFilters: boolean
  onOpenMobileFilters: () => void
  onClearFilters: () => void
}

export const CatalogToolbar = ({
  search,
  onSearchChange,
  resultCount,
  hasActiveFilters,
  onOpenMobileFilters,
  onClearFilters,
}: CatalogToolbarProps) => {
  const [isResultBumping, setIsResultBumping] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    setIsResultBumping(true)
    const timer = window.setTimeout(() => {
      setIsResultBumping(false)
    }, 520)

    return () => {
      window.clearTimeout(timer)
    }
  }, [resultCount])

  return (
    <div className="mb-3 space-y-3 bg-transparent transition-all duration-300">
      <div className="flex flex-row items-center gap-2 sm:justify-between">
        <motion.label
          className="relative block w-full flex-1 sm:max-w-xl"
          htmlFor="catalog-search"
          animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted transition-colors duration-200"
            aria-hidden="true"
          />
          <input
            id="catalog-search"
            type="text"
            aria-label="Buscar produto por nome ou tag"
            placeholder="Buscar por nome ou tag..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="h-10 w-full rounded-xl border border-brand-surface bg-white pl-10 pr-3 text-sm text-brand-text placeholder:text-brand-muted transition-all duration-200 focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/30 focus-visible:outline-none sm:h-11"
          />
        </motion.label>

        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-surface bg-white text-brand-primary transition-all duration-200 hover:bg-brand-bg hover:-translate-y-0.5 md:hidden"
          aria-label="Abrir filtros no mobile"
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-brand-primary sm:text-sm">
        <p className="font-medium">
          <AnimatedCounter value={resultCount} className={cn(
              'inline-flex min-w-7 items-center justify-center rounded-md px-1.5 font-bold text-brand-text transition-all duration-500',
              isResultBumping && 'scale-110 bg-brand-accent/20',
            )} />{' '}
          produtos encontrados
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            aria-label="Limpar todos os filtros"
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-brand-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary/10 sm:h-auto sm:border sm:border-brand-surface sm:px-3 sm:py-1.5 sm:text-sm sm:text-brand-text"
          >
            <X size={14} aria-hidden="true" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}
