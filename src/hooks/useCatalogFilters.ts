import { useEffect, useMemo, useState } from 'react'
import type { CatalogSort, CategoryFilter, CatalogFiltersState, Product } from '../types/product'

interface UseCatalogFiltersParams {
  products: Product[]
  priceBounds: { min: number; max: number }
  initialCategory?: CategoryFilter
  initialSearch?: string
  initialTags?: string[]
  initialOnlyAvailable?: boolean
  initialSort?: CatalogSort
  initialPriceMin?: number | null
  initialPriceMax?: number | null
}

const normalizeText = (value: string): string => value.trim().toLowerCase()

const normalizeTags = (tags: string[]): string[] =>
  Array.from(new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0))).sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  )

const normalizeSort = (value: string | undefined): CatalogSort => {
  const sort = (value ?? '').trim().toLowerCase()

  if (sort === 'price_asc' || sort === 'price_desc' || sort === 'name_asc' || sort === 'name_desc') {
    return sort
  }

  return 'relevance'
}

const clampToRange = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, value))
}

export const useCatalogFilters = ({
  products,
  priceBounds,
  initialCategory = 'all',
  initialSearch = '',
  initialTags = [],
  initialOnlyAvailable = false,
  initialSort = 'relevance',
  initialPriceMin = null,
  initialPriceMax = null,
}: UseCatalogFiltersParams) => {
  const safeInitialPriceRange = useMemo(() => {
    const normalizedInitialPriceMin =
      initialPriceMin === null ? priceBounds.min : clampToRange(initialPriceMin, priceBounds.min, priceBounds.max)
    const normalizedInitialPriceMax =
      initialPriceMax === null ? priceBounds.max : clampToRange(initialPriceMax, priceBounds.min, priceBounds.max)

    return {
      min: Math.min(normalizedInitialPriceMin, normalizedInitialPriceMax),
      max: Math.max(normalizedInitialPriceMin, normalizedInitialPriceMax),
    }
  }, [initialPriceMax, initialPriceMin, priceBounds.max, priceBounds.min])

  const normalizedInitialTags = useMemo(() => normalizeTags(initialTags), [initialTags])

  const normalizedInitialFilters = useMemo(
    () => ({
      search: initialSearch,
      category: initialCategory,
      priceRange: safeInitialPriceRange,
      selectedTags: normalizedInitialTags,
      onlyAvailable: initialOnlyAvailable,
      sort: normalizeSort(initialSort),
    }),
    [initialCategory, initialOnlyAvailable, initialSearch, initialSort, normalizedInitialTags, safeInitialPriceRange],
  )

  const [filters, setFilters] = useState<CatalogFiltersState>({
    ...normalizedInitialFilters,
  })

  useEffect(() => {
    setFilters((current) => {
      const isUnchanged =
        current.search === normalizedInitialFilters.search &&
        current.category === normalizedInitialFilters.category &&
        current.onlyAvailable === normalizedInitialFilters.onlyAvailable &&
        current.sort === normalizedInitialFilters.sort &&
        current.priceRange.min === normalizedInitialFilters.priceRange.min &&
        current.priceRange.max === normalizedInitialFilters.priceRange.max &&
        current.selectedTags.length === normalizedInitialFilters.selectedTags.length &&
        current.selectedTags.every((tag, index) => tag === normalizedInitialFilters.selectedTags[index])

      if (isUnchanged) {
        return current
      }

      return normalizedInitialFilters
    })
  }, [normalizedInitialFilters])

  const baseFilteredProducts = useMemo(() => {
    const searchText = normalizeText(filters.search)

    return products.filter((product) => {
      const matchesSearch =
        searchText.length === 0 ||
        normalizeText(product.name).includes(searchText) ||
        product.tags.some((tag) => normalizeText(tag).includes(searchText))

      const matchesCategory = filters.category === 'all' || (product.categoryIds || []).includes(filters.category) || product.categoryId === filters.category

      const matchesTags =
        filters.selectedTags.length === 0 ||
        filters.selectedTags.every((selectedTag) => product.tags.includes(selectedTag))

      const matchesAvailability = !filters.onlyAvailable || product.flags.isAvailable

      return matchesSearch && matchesCategory && matchesTags && matchesAvailability
    })
  }, [filters.category, filters.onlyAvailable, filters.search, filters.selectedTags, products])

  const activePriceBounds = useMemo(() => {
    if (baseFilteredProducts.length === 0) {
      return priceBounds
    }

    const prices = baseFilteredProducts.map((product) => product.price)

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }, [baseFilteredProducts, priceBounds])

  const effectivePriceRange =
    filters.priceRange.min === 0 && filters.priceRange.max === 0 && activePriceBounds.max > 0
      ? activePriceBounds
      : {
          min: Math.min(Math.max(filters.priceRange.min, activePriceBounds.min), activePriceBounds.max),
          max: Math.max(
            Math.min(filters.priceRange.max, activePriceBounds.max),
            Math.min(Math.max(filters.priceRange.min, activePriceBounds.min), activePriceBounds.max),
          ),
        }

  const filteredProducts = useMemo(() => {
    const filteredByPrice = baseFilteredProducts.filter((product) => {
      const matchesPrice =
        product.price >= effectivePriceRange.min && product.price <= effectivePriceRange.max

      return matchesPrice
    })

    const sorted = [...filteredByPrice]

    if (filters.sort === 'price_asc') {
      sorted.sort((firstProduct, secondProduct) => firstProduct.price - secondProduct.price)
      return sorted
    }

    if (filters.sort === 'price_desc') {
      sorted.sort((firstProduct, secondProduct) => secondProduct.price - firstProduct.price)
      return sorted
    }

    if (filters.sort === 'name_asc') {
      sorted.sort((firstProduct, secondProduct) => firstProduct.name.localeCompare(secondProduct.name, 'pt-BR'))
      return sorted
    }

    if (filters.sort === 'name_desc') {
      sorted.sort((firstProduct, secondProduct) => secondProduct.name.localeCompare(firstProduct.name, 'pt-BR'))
      return sorted
    }

    return sorted
  }, [baseFilteredProducts, effectivePriceRange.max, effectivePriceRange.min, filters.sort])

  const isPriceFilterActive =
    effectivePriceRange.min !== activePriceBounds.min || effectivePriceRange.max !== activePriceBounds.max

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.category !== 'all' ||
    isPriceFilterActive ||
    filters.selectedTags.length > 0 ||
    filters.onlyAvailable ||
    filters.sort !== 'relevance'

  const setSearch = (value: string): void => {
    setFilters((current) => ({
      ...current,
      search: value,
    }))
  }

  const setCategory = (category: CategoryFilter): void => {
    setFilters((current) => ({
      ...current,
      category,
    }))
  }

  const setPriceMin = (priceMin: number): void => {
    setFilters((current) => ({
      ...current,
      priceRange: {
        min: Math.max(activePriceBounds.min, Math.min(priceMin, effectivePriceRange.max)),
        max: effectivePriceRange.max,
      },
    }))
  }

  const setPriceMax = (priceMax: number): void => {
    setFilters((current) => ({
      ...current,
      priceRange: {
        min: effectivePriceRange.min,
        max: Math.min(activePriceBounds.max, Math.max(priceMax, effectivePriceRange.min)),
      },
    }))
  }

  const toggleTag = (tag: string): void => {
    setFilters((current) => {
      const isTagSelected = current.selectedTags.includes(tag)

      return {
        ...current,
        selectedTags: isTagSelected
          ? current.selectedTags.filter((selectedTag) => selectedTag !== tag)
          : [...current.selectedTags, tag],
      }
    })
  }

  const setOnlyAvailable = (value: boolean): void => {
    setFilters((current) => ({
      ...current,
      onlyAvailable: value,
    }))
  }

  const setSort = (sort: CatalogSort): void => {
    setFilters((current) => ({
      ...current,
      sort: normalizeSort(sort),
    }))
  }

  const clearFilters = (): void => {
    setFilters({
      search: '',
      category: 'all',
      priceRange: {
        min: priceBounds.min,
        max: priceBounds.max,
      },
      selectedTags: [],
      onlyAvailable: false,
      sort: 'relevance',
    })
  }

  return {
    filters: {
      ...filters,
      priceRange: effectivePriceRange,
    },
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
  }
}
