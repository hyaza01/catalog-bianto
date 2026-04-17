import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '../api/supabase'
import { CATEGORY_LABELS, MAIN_CATEGORIES } from '../data'
import type { Category } from '../types/product'

const categoriesFeaturedLocalStorageKey = 'bianto-categories-featured-local'

interface PublicCategoryRow {
  id: unknown
  slug: unknown
  name: unknown
  description?: unknown
  is_featured?: unknown
}

export interface PublicCategory {
  id: string
  slug: string
  name: string
  description?: string | null
  isFeatured: boolean
}

interface UsePublicCategoriesResult {
  data: PublicCategory[]
  isLoading: boolean
  error: string | null
}

export const publicCategoriesQueryKey = ['public-categories'] as const

const readBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') {
    return value
  }

  return fallback
}

const readFeaturedOverrides = (): Record<string, boolean> => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(categoriesFeaturedLocalStorageKey)

    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw)

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {}
    }

    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, boolean>>((accumulator, [key, value]) => {
      if (typeof value === 'boolean') {
        accumulator[key] = value
      }

      return accumulator
    }, {})
  } catch {
    return {}
  }
}

const isMissingColumnError = (message: string): boolean =>
  /column|does not exist|schema cache|could not find/.test(message.toLowerCase())

const withTimeout = async <T>(promiseLike: PromiseLike<T>, timeoutMs = 10000): Promise<T> => {
  return await new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Tempo limite ao consultar categorias no Supabase.'))
    }, timeoutMs)

    Promise.resolve(promiseLike)
      .then((value) => {
        clearTimeout(timeoutId)
        resolve(value)
      })
      .catch((errorLike) => {
        clearTimeout(timeoutId)
        reject(errorLike)
      })
  })
}

const fallbackCategories = (featuredOverrides: Record<string, boolean>): PublicCategory[] => {
  return (Object.entries(CATEGORY_LABELS) as Array<[Category, string]>).map(([slug, name]) => ({
    id: slug,
    slug,
    name,
    description: null,
    isFeatured: featuredOverrides[slug] ?? MAIN_CATEGORIES.includes(slug),
  }))
}

const applyFeaturedFallbacks = (categories: PublicCategory[]): PublicCategory[] => {
  if (categories.length === 0) {
    return categories
  }

  if (categories.some((category) => category.isFeatured)) {
    return categories
  }

  const preferredSlugSet = new Set<string>(MAIN_CATEGORIES)
  const byPreferredSlug = categories.map((category) => ({
    ...category,
    isFeatured: preferredSlugSet.has(category.slug),
  }))

  if (byPreferredSlug.some((category) => category.isFeatured)) {
    return byPreferredSlug
  }

  const fallbackFeaturedCount = Math.min(4, categories.length)

  return categories.map((category, index) => ({
    ...category,
    isFeatured: index < fallbackFeaturedCount,
  }))
}

const normalizeCategoryRow = (row: PublicCategoryRow, featuredOverrides: Record<string, boolean>): PublicCategory | null => {
  if (typeof row.id !== 'string' || typeof row.name !== 'string' || typeof row.slug !== 'string') {
    return null
  }

  const featuredOverride = featuredOverrides[row.id]

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: typeof row.description === 'string' ? row.description : null,
    isFeatured: featuredOverride ?? readBoolean(row.is_featured, false),
  }
}

const fetchPublicCategories = async (): Promise<PublicCategory[]> => {
  const featuredOverrides = readFeaturedOverrides()

  if (!isSupabaseConfigured) {
    return applyFeaturedFallbacks(fallbackCategories(featuredOverrides))
  }

  try {
    const selectAttempts = [
      'id, slug, name, description, is_featured',
      'id, slug, name, is_featured',
      'id, slug, name, description',
      'id, slug, name',
    ]

    let rows: PublicCategoryRow[] | null = null
    let queryError: { message: string } | null = null

    for (const selectColumns of selectAttempts) {
      const result = await withTimeout(
        supabase
          .from('categories')
          .select(selectColumns)
          .order('name', { ascending: true }),
      )

      if (!result.error) {
        rows = (result.data as unknown as PublicCategoryRow[] | null) ?? null
        queryError = null
        break
      }

      queryError = { message: result.error.message || 'Não foi possível carregar as categorias.' }

      if (!isMissingColumnError(queryError.message)) {
        break
      }
    }

    if (queryError) {
      throw new Error(queryError.message || 'Não foi possível carregar as categorias.')
    }

    return applyFeaturedFallbacks(
      (rows ?? [])
        .map((row) => normalizeCategoryRow(row, featuredOverrides))
        .filter((item): item is PublicCategory => item !== null),
    )
  } catch {
    return applyFeaturedFallbacks(fallbackCategories(featuredOverrides))
  }
}

export const usePublicCategories = (): UsePublicCategoriesResult => {
  const categoriesQuery = useQuery({
    queryKey: publicCategoriesQueryKey,
    queryFn: fetchPublicCategories,
  })

  return {
    data: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error instanceof Error ? categoriesQuery.error.message : null,
  }
}
