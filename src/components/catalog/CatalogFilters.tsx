import { useEffect, useState } from 'react'
import { type CatalogFiltersState, type CatalogSort, type CategoryFilter, type PriceRange } from '../../types/product'
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback'
import { cn } from '../../utils/cn'
import { formatBRL } from '../../utils/format'

const SORT_OPTIONS: Array<{ value: CatalogSort; label: string }> = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price_asc', label: 'Menor preco' },
  { value: 'price_desc', label: 'Maior preco' },
  { value: 'name_asc', label: 'Nome (A-Z)' },
  { value: 'name_desc', label: 'Nome (Z-A)' },
]

interface CatalogFiltersProps {
  filters: CatalogFiltersState
  availableCategories: Array<{
    id: string
    name: string
  }>
  tags: string[]
  priceBounds: PriceRange
  hasActiveFilters: boolean
  onCategoryChange: (category: CategoryFilter) => void
  onPriceMinChange: (value: number) => void
  onPriceMaxChange: (value: number) => void
  onToggleTag: (tag: string) => void
  onOnlyAvailableChange: (value: boolean) => void
  onSortChange: (sort: CatalogSort) => void
  onClearFilters: () => void
}

export const CatalogFilters = ({
  filters,
  availableCategories,
  tags,
  priceBounds,
  hasActiveFilters,
  onCategoryChange,
  onPriceMinChange,
  onPriceMaxChange,
  onToggleTag,
  onOnlyAvailableChange,
  onSortChange,
  onClearFilters,
}: CatalogFiltersProps) => {
  const [draftPriceMin, setDraftPriceMin] = useState(filters.priceRange.min)
  const [draftPriceMax, setDraftPriceMax] = useState(filters.priceRange.max)

  const { debounced: debouncedMinChange, cancel: cancelDebouncedMin } = useDebouncedCallback(onPriceMinChange, 400)
  const { debounced: debouncedMaxChange, cancel: cancelDebouncedMax } = useDebouncedCallback(onPriceMaxChange, 400)

  useEffect(() => {
    setDraftPriceMin(filters.priceRange.min)
    setDraftPriceMax(filters.priceRange.max)
  }, [filters.priceRange.max, filters.priceRange.min])

  const handleMinSliderChange = (nextMin: number) => {
    const normalizedMin = Math.min(nextMin, draftPriceMax)
    setDraftPriceMin(normalizedMin)
    debouncedMinChange(normalizedMin)
  }

  const handleMaxSliderChange = (nextMax: number) => {
    const normalizedMax = Math.max(nextMax, draftPriceMin)
    setDraftPriceMax(normalizedMax)
    debouncedMaxChange(normalizedMax)
  }

  const commitMinSlider = () => {
    cancelDebouncedMin()
    onPriceMinChange(draftPriceMin)
  }

  const commitMaxSlider = () => {
    cancelDebouncedMax()
    onPriceMaxChange(draftPriceMax)
  }

  const handleClearAllFilters = () => {
    cancelDebouncedMin()
    cancelDebouncedMax()
    onClearFilters()
  }

  return (
    <div className="space-y-6 rounded-2xl border border-[#A9B8A3] bg-[#D8C8B8] p-4 shadow-[0_2px_8px_rgba(43,43,43,0.06)] transition-all duration-300 sm:p-5">
      <section className="space-y-3">
        <h3 className="font-display text-xl font-semibold text-[#2B2B2B]">Ordenar por</h3>
        <label className="grid gap-1 text-sm font-medium text-[#2B2B2B]" htmlFor="catalog-sort">
          <select
            id="catalog-sort"
            aria-label="Ordenar produtos"
            value={filters.sort}
            onChange={(event) => onSortChange(event.target.value as CatalogSort)}
            className="h-10 rounded-xl border border-[#A9B8A3] bg-[#EDE6DE] px-3 text-sm text-[#2B2B2B] transition-all duration-300 focus-visible:border-[#5F6F5A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F6F5A]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-xl font-semibold text-[#2B2B2B]">Categoria</h3>
        <div className="space-y-2">
          <label
            className={cn(
              'group flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(43,43,43,0.08)]',
              filters.category === 'all'
                ? 'border-[#5F6F5A] bg-[#5F6F5A]/10 text-[#2B2B2B] font-medium'
                : 'border-[#A9B8A3] bg-[#EDE6DE] text-[#2B2B2B] hover:border-[#5F6F5A]/50',
            )}
          >
            <input
              type="radio"
              aria-label="Filtrar por todas as categorias"
              checked={filters.category === 'all'}
              onChange={() => onCategoryChange('all')}
              className="h-4 w-4 accent-[#5F6F5A] transition-transform duration-300 group-hover:scale-110"
            />
            Todas
          </label>
          {availableCategories.length === 0 && (
            <p className="text-xs text-[#5F6F5A]">Nenhuma categoria cadastrada para filtro.</p>
          )}
          {availableCategories.map((category) => (
            <label
              key={category.id}
              className={cn(
                'group flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(43,43,43,0.08)]',
                filters.category === category.id
                  ? 'border-[#5F6F5A] bg-[#5F6F5A]/10 text-[#2B2B2B] font-medium'
                  : 'border-[#A9B8A3] bg-[#EDE6DE] text-[#2B2B2B] hover:border-[#5F6F5A]/50',
              )}
            >
              <input
                type="radio"
                aria-label={`Filtrar pela categoria ${category.name}`}
                checked={filters.category === category.id}
                onChange={() => onCategoryChange(category.id)}
                className="h-4 w-4 accent-[#5F6F5A] transition-transform duration-300 group-hover:scale-110"
              />
              {category.name}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-xl font-semibold text-[#2B2B2B]">Faixa de preco</h3>
        <div className="grid gap-3 text-sm text-[#5F6F5A]">
          <label
            className="grid gap-2 rounded-xl border border-[#A9B8A3] bg-[#EDE6DE] px-3 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#5F6F5A]/50 focus-within:border-[#5F6F5A] focus-within:shadow-[0_2px_8px_rgba(43,43,43,0.08)]"
            htmlFor="price-min"
          >
            Minimo: <span className="font-mono text-[#2B2B2B] font-medium">{formatBRL(draftPriceMin)}</span>
            <input
              id="price-min"
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={draftPriceMin}
              onChange={(event) => handleMinSliderChange(Number(event.target.value))}
              onMouseUp={commitMinSlider}
              onTouchEnd={commitMinSlider}
              aria-label="Faixa de preco minima"
              className="cursor-pointer accent-[#5F6F5A] transition-all duration-300"
            />
          </label>
          <label
            className="grid gap-2 rounded-xl border border-[#A9B8A3] bg-[#EDE6DE] px-3 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#5F6F5A]/50 focus-within:border-[#5F6F5A] focus-within:shadow-[0_2px_8px_rgba(43,43,43,0.08)]"
            htmlFor="price-max"
          >
            Maximo: <span className="font-mono text-[#2B2B2B] font-medium">{formatBRL(draftPriceMax)}</span>
            <input
              id="price-max"
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={draftPriceMax}
              onChange={(event) => handleMaxSliderChange(Number(event.target.value))}
              onMouseUp={commitMaxSlider}
              onTouchEnd={commitMaxSlider}
              aria-label="Faixa de preco maxima"
              className="cursor-pointer accent-[#5F6F5A] transition-all duration-300"
            />
          </label>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-display text-xl font-semibold text-[#2B2B2B]">Tags</h3>
        <div className="max-h-48 space-y-2 overflow-y-auto px-1 py-1">
          {tags.map((tag) => {
            const checked = filters.selectedTags.includes(tag)

            return (
              <label
                key={tag}
                className={cn(
                  'group flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all duration-300 ease-out hover:shadow-[0_2px_8px_rgba(43,43,43,0.08)]',
                  checked
                    ? 'border-[#5F6F5A] bg-[#5F6F5A]/10 text-[#2B2B2B] font-medium'
                    : 'border-[#A9B8A3] bg-[#EDE6DE] text-[#2B2B2B] hover:border-[#5F6F5A]/50',
                )}
              >
                <input
                  type="checkbox"
                  aria-label={`Filtrar pela tag ${tag}`}
                  checked={checked}
                  onChange={() => onToggleTag(tag)}
                  className="h-4 w-4 accent-[#5F6F5A] transition-transform duration-300 group-hover:scale-110"
                />
                {tag}
              </label>
            )
          })}
        </div>
      </section>

      <section>
        <label
          className={cn(
            'group flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(43,43,43,0.08)]',
            filters.onlyAvailable
              ? 'border-[#5F6F5A] bg-[#5F6F5A]/10 text-[#2B2B2B] font-medium'
              : 'border-[#A9B8A3] bg-[#EDE6DE] text-[#2B2B2B] hover:border-[#5F6F5A]/50',
          )}
        >
          <input
            type="checkbox"
            aria-label="Mostrar apenas produtos disponiveis"
            checked={filters.onlyAvailable}
            onChange={(event) => onOnlyAvailableChange(event.target.checked)}
            className="h-4 w-4 accent-[#5F6F5A] transition-transform duration-300 group-hover:scale-110"
          />
          Apenas disponiveis
        </label>
      </section>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearAllFilters}
          aria-label="Limpar filtros ativos"
          className="w-full rounded-xl border border-[#A9B8A3] bg-transparent py-2.5 text-sm font-semibold text-[#2B2B2B] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#EDE6DE] hover:shadow-sm focus-visible:border-[#5F6F5A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F6F5A]"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
