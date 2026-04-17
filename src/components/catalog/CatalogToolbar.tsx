import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '../../utils/cn'

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
        <label className="relative block w-full flex-1 sm:max-w-xl" htmlFor="catalog-search">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A9B8A3] transition-colors duration-300"
            aria-hidden="true"
          />
          <input
            id="catalog-search"
            type="text"
            aria-label="Buscar produto por nome ou tag"
            placeholder="Buscar por nome ou tag"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#D8C8B8] bg-white pl-10 pr-3 text-sm text-[#2B2B2B] placeholder:text-[#A9B8A3] transition-all duration-300 focus-visible:border-[#5F6F5A] focus-visible:ring-1 focus-visible:ring-[#5F6F5A]/30 focus-visible:outline-none sm:h-11 sm:rounded-xl"
          />
        </label>

        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-lg border border-[#D8C8B8] bg-white text-[#5F6F5A] transition-all duration-300 hover:bg-[#F7F3EE] hover:-translate-y-0.5 md:hidden"
          aria-label="Abrir filtros no mobile"
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#5F6F5A] sm:text-sm">
        <p className="font-medium">
          <span
            className={cn(
              'inline-flex min-w-7 items-center justify-center rounded-md px-1.5 font-bold text-[#2B2B2B] transition-all duration-500',
              isResultBumping && 'scale-110 bg-[#C9A46A]/20',
            )}
          >
            {resultCount}
          </span>{' '}
          produtos encontrados
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            aria-label="Limpar todos os filtros"
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#5F6F5A] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#5F6F5A]/10 hover:shadow-sm sm:h-auto sm:border sm:border-[#D8C8B8] sm:px-3 sm:py-1.5 sm:text-sm sm:text-[#2B2B2B]"
          >
            <X size={14} aria-hidden="true" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}
