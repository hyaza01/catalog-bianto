import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { CatalogFilters } from '../components/catalog/CatalogFilters'
import { CatalogToolbar } from '../components/catalog/CatalogToolbar'
import { FilterBottomSheet } from '../components/catalog/FilterBottomSheet'
import { ProductDetailModal } from '../components/catalog/ProductDetailModal'
import { ProductGrid } from '../components/catalog/ProductGrid'
import { MobileCheckoutBar } from '../components/selection/MobileCheckoutBar'
import { useCatalogFilters } from '../hooks/useCatalogFilters'
import { useProducts } from '../hooks/useProducts'
import { usePublicCategories } from '../hooks/usePublicCategories'
import { useSelection } from '../hooks/useSelection'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { useSelectionStore } from '../store/selectionStore'
import { resolveBrazilWhatsAppNumber } from '../utils/phone'
import { type CatalogSort, type CategoryFilter, type Product } from '../types/product'

interface LayoutContext {
  openSelectionDrawer: () => void
}

const QUERY_KEYS = {
  category: 'categoria',
  search: 'busca',
  tags: 'tags',
  onlyAvailable: 'disponiveis',
  priceMin: 'precoMin',
  priceMax: 'precoMax',
  sort: 'ordenar',
} as const

const SORT_LABELS: Record<CatalogSort, string> = {
  relevance: 'Relevância',
  price_asc: 'Menor preço',
  price_desc: 'Maior preço',
  name_asc: 'Nome (A-Z)',
  name_desc: 'Nome (Z-A)',
}

const CATALOG_SORT_VALUES: CatalogSort[] = ['relevance', 'price_asc', 'price_desc', 'name_asc', 'name_desc']

const getNumericFromQuery = (value: string | null): number | null => {
  if (!value) {
    return null
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

const getSortFromQuery = (value: string | null): CatalogSort => {
  if (!value) {
    return 'relevance'
  }

  const normalized = value.trim().toLowerCase() as CatalogSort
  return CATALOG_SORT_VALUES.includes(normalized) ? normalized : 'relevance'
}

const setParamOrDelete = (
  params: URLSearchParams,
  key: string,
  value: string | number | null | undefined,
): void => {
  if (value === null || value === undefined) {
    params.delete(key)
    return
  }

  const normalized = typeof value === 'string' ? value.trim() : `${value}`

  if (!normalized) {
    params.delete(key)
    return
  }

  params.set(key, normalized)
}

const getCategoryFromQuery = (value: string | null): CategoryFilter => {
  return value?.trim() || 'all'
}

const getSearchFromQuery = (value: string | null): string => {
  return value?.trim() || ''
}

const getTagsFromQuery = (value: string | null): string[] => {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

const getOnlyAvailableFromQuery = (value: string | null): boolean => {
  const normalized = (value ?? '').trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'sim'
}

export const CatalogPage = () => {
  const { openSelectionDrawer } = useOutletContext<LayoutContext>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { data: products, isLoading, error } = useProducts()
  const { settings: siteSettings } = useSiteSettings()
  const { detailedItems, totalQuantity } = useSelection(products)
  const { data: publicCategories, isLoading: isLoadingPublicCategories, error: publicCategoriesError } = usePublicCategories()

  const allTags = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.tags))).sort((a, b) => a.localeCompare(b)),
    [products],
  )

  const priceBounds = useMemo(() => {
    if (products.length === 0) {
      return { min: 0, max: 0 }
    }

    const values = products.map((product) => product.price)
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }, [products])

  const queryCategory = getCategoryFromQuery(searchParams.get(QUERY_KEYS.category))
  const querySearch = getSearchFromQuery(searchParams.get(QUERY_KEYS.search))
  const queryTags = getTagsFromQuery(searchParams.get(QUERY_KEYS.tags))
  const queryOnlyAvailable = getOnlyAvailableFromQuery(searchParams.get(QUERY_KEYS.onlyAvailable))
  const queryPriceMin = getNumericFromQuery(searchParams.get(QUERY_KEYS.priceMin))
  const queryPriceMax = getNumericFromQuery(searchParams.get(QUERY_KEYS.priceMax))
  const querySort = getSortFromQuery(searchParams.get(QUERY_KEYS.sort))

  const availableCategories = useMemo(() => {
    if (publicCategories.length > 0) {
      return publicCategories.map((category) => ({
        id: category.id,
        name: category.name,
      }))
    }

    if (publicCategoriesError) {
      return []
    }

    const fallbackMap = new Map<string, string>()

    products.forEach((product) => {
      if (product.categoryId) {
        fallbackMap.set(product.categoryId, product.categoryName || 'Categoria')
      }
    })

    return Array.from(fallbackMap.entries()).map(([id, name]) => ({
      id,
      name,
    }))
  }, [products, publicCategories, publicCategoriesError])

  const catalogFilters = useCatalogFilters({
    products,
    priceBounds,
    initialCategory: queryCategory,
    initialSearch: querySearch,
    initialTags: queryTags,
    initialOnlyAvailable: queryOnlyAvailable,
    initialSort: querySort,
    initialPriceMin: queryPriceMin,
    initialPriceMax: queryPriceMax,
  })

  const {
    filters,
    activePriceBounds,
    filteredProducts,
    hasActiveFilters,
    setSearch,
    setCategory,
    setPriceMin,
    setPriceMax,
    toggleTag,
    setOnlyAvailable,
    setSort,
    clearFilters,
  } = catalogFilters

  const addItem = useSelectionStore((state) => state.addItem)

  const estimatedTotal = useMemo(
    () => detailedItems.reduce((accumulator, item) => accumulator + item.product.price * item.quantity, 0),
    [detailedItems],
  )

  const targetWhatsAppNumber = useMemo(
    () =>
      resolveBrazilWhatsAppNumber([
        siteSettings.whatsappNumber,
        siteSettings.contactPhone,
        import.meta.env.VITE_WHATSAPP_NUMBER,
      ]),
    [siteSettings.contactPhone, siteSettings.whatsappNumber],
  )

  const isCategoryDataReady =
    !isLoadingPublicCategories &&
    (publicCategories.length > 0 || publicCategoriesError !== null || !isLoading)

  const updateQueryParams = (updater: (params: URLSearchParams) => void): void => {
    const nextParams = new URLSearchParams(searchParams)
    updater(nextParams)
    setSearchParams(nextParams, { replace: true })
  }

  const removeFilterTag = (tag: string): void => {
    const nextTags = filters.selectedTags.filter((selectedTag) => selectedTag !== tag)

    updateQueryParams((params) => {
      setParamOrDelete(params, QUERY_KEYS.tags, nextTags.length > 0 ? nextTags.join(',') : null)
    })

    toggleTag(tag)
  }

  useEffect(() => {
    if (filters.category === 'all') {
      return
    }

    if (!isCategoryDataReady) {
      return
    }

    const categoryExists = availableCategories.some((category) => category.id === filters.category)

    if (categoryExists) {
      return
    }

    setCategory('all')

    updateQueryParams((params) => {
      params.delete(QUERY_KEYS.category)
    })
  }, [availableCategories, filters.category, isCategoryDataReady])

  const handleSearchChange = (value: string): void => {
    setSearch(value)

    updateQueryParams((params) => {
      setParamOrDelete(params, QUERY_KEYS.search, value)
    })
  }

  const handleCategoryChange = (category: CategoryFilter): void => {
    setCategory(category)

    updateQueryParams((params) => {
      setParamOrDelete(params, QUERY_KEYS.category, category === 'all' ? null : category)
    })
  }

  const handlePriceMinChange = (value: number): void => {
    setPriceMin(value)

    updateQueryParams((params) => {
      const shouldPersist = value > activePriceBounds.min
      setParamOrDelete(params, QUERY_KEYS.priceMin, shouldPersist ? Math.round(value) : null)
    })
  }

  const handlePriceMaxChange = (value: number): void => {
    setPriceMax(value)

    updateQueryParams((params) => {
      const shouldPersist = value < activePriceBounds.max
      setParamOrDelete(params, QUERY_KEYS.priceMax, shouldPersist ? Math.round(value) : null)
    })
  }

  const handleToggleTag = (tag: string): void => {
    const isSelected = filters.selectedTags.includes(tag)
    const nextTags = isSelected
      ? filters.selectedTags.filter((selectedTag) => selectedTag !== tag)
      : [...filters.selectedTags, tag]

    updateQueryParams((params) => {
      setParamOrDelete(params, QUERY_KEYS.tags, nextTags.length > 0 ? nextTags.join(',') : null)
    })

    toggleTag(tag)
  }

  const handleOnlyAvailableChange = (value: boolean): void => {
    setOnlyAvailable(value)

    updateQueryParams((params) => {
      setParamOrDelete(params, QUERY_KEYS.onlyAvailable, value ? '1' : null)
    })
  }

  const handleSortChange = (sort: CatalogSort): void => {
    setSort(sort)

    updateQueryParams((params) => {
      setParamOrDelete(params, QUERY_KEYS.sort, sort === 'relevance' ? null : sort)
    })
  }

  const handleClearFilters = (): void => {
    clearFilters()

    updateQueryParams((params) => {
      params.delete(QUERY_KEYS.category)
      params.delete(QUERY_KEYS.search)
      params.delete(QUERY_KEYS.tags)
      params.delete(QUERY_KEYS.onlyAvailable)
      params.delete(QUERY_KEYS.priceMin)
      params.delete(QUERY_KEYS.priceMax)
      params.delete(QUERY_KEYS.sort)
    })
  }

  const filterProps = {
    filters,
    availableCategories,
    tags: allTags,
    priceBounds: activePriceBounds,
    hasActiveFilters,
    onCategoryChange: handleCategoryChange,
    onPriceMinChange: handlePriceMinChange,
    onPriceMaxChange: handlePriceMaxChange,
    onToggleTag: handleToggleTag,
    onOnlyAvailableChange: handleOnlyAvailableChange,
    onSortChange: handleSortChange,
    onClearFilters: handleClearFilters,
  }

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; onRemove: () => void }> = []

    if (filters.search.trim().length > 0) {
      chips.push({
        id: 'search',
        label: `Busca: ${filters.search.trim()}`,
        onRemove: () => handleSearchChange(''),
      })
    }

    if (filters.category !== 'all') {
      const categoryLabel = availableCategories.find((category) => category.id === filters.category)?.name ?? 'Categoria'

      chips.push({
        id: `category-${filters.category}`,
        label: categoryLabel,
        onRemove: () => handleCategoryChange('all'),
      })
    }

    if (filters.onlyAvailable) {
      chips.push({
        id: 'available',
        label: 'Apenas disponíveis',
        onRemove: () => handleOnlyAvailableChange(false),
      })
    }

    if (filters.priceRange.min > activePriceBounds.min) {
      chips.push({
        id: 'price-min',
        label: `Min ${Math.round(filters.priceRange.min)}`,
        onRemove: () => handlePriceMinChange(activePriceBounds.min),
      })
    }

    if (filters.priceRange.max < activePriceBounds.max) {
      chips.push({
        id: 'price-max',
        label: `Max ${Math.round(filters.priceRange.max)}`,
        onRemove: () => handlePriceMaxChange(activePriceBounds.max),
      })
    }

    filters.selectedTags.forEach((tag) => {
      chips.push({
        id: `tag-${tag}`,
        label: `#${tag}`,
        onRemove: () => removeFilterTag(tag),
      })
    })

    if (filters.sort !== 'relevance') {
      chips.push({
        id: `sort-${filters.sort}`,
        label: SORT_LABELS[filters.sort],
        onRemove: () => handleSortChange('relevance'),
      })
    }

    return chips
  }, [
    activePriceBounds.max,
    activePriceBounds.min,
    availableCategories,
    filters.category,
    filters.onlyAvailable,
    filters.priceRange.max,
    filters.priceRange.min,
    filters.search,
    filters.selectedTags,
    filters.sort,
  ])

  return (
    <div className="mx-auto w-full max-w-7xl overflow-x-clip px-3 pb-28 pt-6 sm:px-4 sm:pt-8 md:pb-8 lg:px-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Catálogo Bianto Store</p>
        <h1 className="mt-1 font-display text-3xl leading-tight text-brand-text sm:text-4xl lg:text-5xl">Monte sua seleção</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-primary">
          Filtre por categoria, faixa de preço e tags para encontrar os itens ideais para seu pedido.
        </p>
        {publicCategoriesError && (
          <p className="mt-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
            Não foi possível carregar categorias cadastradas: {publicCategoriesError}
          </p>
        )}
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-24">
            <CatalogFilters {...filterProps} />
          </div>
        </aside>

        <section className="min-w-0 space-y-3 overflow-x-clip">
          <CatalogToolbar
            search={filters.search}
            onSearchChange={handleSearchChange}
            resultCount={filteredProducts.length}
            hasActiveFilters={hasActiveFilters}
            onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
            onClearFilters={handleClearFilters}
          />

          {activeFilterChips.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-brand-surface bg-brand-bg p-2.5">
              <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max items-center gap-2 pr-1">
                  {activeFilterChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={chip.onRemove}
                      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-brand-accent bg-brand-accent px-3 py-1 text-xs font-semibold text-brand-text transition hover:brightness-95"
                    >
                      <span className="whitespace-nowrap">{chip.label}</span>
                      <span className="text-[11px] font-bold leading-none text-brand-text" aria-hidden="true">
                        x
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearFilters}
                className="min-h-11 shrink-0 rounded-full border border-brand-primary/30 bg-transparent px-3 py-1 text-xs font-semibold text-brand-primary transition hover:bg-brand-primary/10 hover:text-brand-primary"
              >
                Limpar tudo
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="rounded-2xl bg-brand-bg/40 p-1.5 sm:p-2" aria-label="Carregando produtos">
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-2xl border border-brand-surface/60 bg-white p-2">
                    <div className="aspect-square rounded-xl bg-brand-surface/50" />
                    <div className="mt-2 h-3 w-2/5 rounded bg-brand-surface/50" />
                    <div className="mt-1.5 h-4 w-full rounded bg-brand-surface/40" />
                    <div className="mt-1 h-4 w-5/6 rounded bg-brand-surface/30" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-brand-surface/30" />
                    <div className="mt-1.5 h-5 w-4/5 rounded bg-brand-surface/40" />
                    <div className="mt-2 h-9 rounded-xl bg-brand-surface/40" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Não foi possível carregar os produtos agora. Tente novamente em instantes.
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              isLoading={isLoading}
              onOpenDetails={setSelectedProduct}
              onSelect={(product) => addItem(product.id, product.minQuantity, '', product.minQuantity)}
            />
          )}
        </section>
      </div>

      <FilterBottomSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filterProps={filterProps}
      />

      <MobileCheckoutBar
        isVisible={totalQuantity > 0}
        items={detailedItems}
        totalItems={totalQuantity}
        totalValue={estimatedTotal}
        whatsappNumber={targetWhatsAppNumber}
        onOpenSelection={openSelectionDrawer}
      />

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            key={selectedProduct.id}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToSelection={(productId, quantity, note) => {
              const selected = products.find((product) => product.id === productId)
              addItem(productId, quantity, note, selected?.minQuantity ?? 1)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
