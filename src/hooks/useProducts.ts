import { useQuery } from '@tanstack/react-query'
import { PRODUCTS } from '../data'
import { isSupabaseConfigured, supabase } from '../api/supabase'
import { CATEGORY_LABELS, CATEGORY_VALUES, type Category, type Product, type ProductVariants } from '../types/product'

interface UseProductsResult {
  data: Product[]
  isLoading: boolean
  error: string | null
}

export const productsQueryKey = ['products'] as const

interface ProductRow {
  id: unknown
  name: unknown
  description: unknown
  category: unknown
  price: unknown
  category_id: unknown
  images: unknown
  min_quantity: unknown
  options: unknown
  metadata: unknown
  tags: unknown
  is_available?: unknown
  is_featured?: unknown
  is_customizable?: unknown
  rating_avg?: unknown
  reviews_count?: unknown
  production_time?: unknown
}

interface CategoryRow {
  id: unknown
  slug: unknown
  name: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isCategory = (value: unknown): value is Category =>
  typeof value === 'string' && CATEGORY_VALUES.includes(value as Category)

const parseStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

const parseVariants = (value: unknown): ProductVariants | undefined => {
  if (!isRecord(value)) {
    return undefined
  }

  const colors = parseStringArray(value.colors)
  const sizes = parseStringArray(value.sizes)

  if (colors.length === 0 && sizes.length === 0) {
    return undefined
  }

  return {
    ...(colors.length > 0 ? { colors } : {}),
    ...(sizes.length > 0 ? { sizes } : {}),
  }
}

const readBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') {
    return value
  }

  return fallback
}

const parseFlags = (row: ProductRow): Product['flags'] => {
  const metadata = isRecord(row.metadata) ? row.metadata : {}

  const isFeatured = readBoolean(row.is_featured, readBoolean(metadata.is_featured, false))
  const isAvailable = readBoolean(row.is_available, readBoolean(metadata.is_available, true))
  const isCustomizable = readBoolean(row.is_customizable, readBoolean(metadata.is_customizable, true))

  return {
    isFeatured,
    isAvailable,
    isCustomizable,
  }
}

const readNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

const readString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

const parseTrustSignals = (row: ProductRow): Pick<Product, 'ratingAvg' | 'reviewsCount' | 'productionTime'> => {
  const metadata = isRecord(row.metadata) ? row.metadata : {}

  const ratingAvg = readNumber(row.rating_avg) ?? readNumber(metadata.rating_avg) ?? readNumber(metadata.rating)
  const reviewsCount = readNumber(row.reviews_count) ?? readNumber(metadata.reviews_count)
  const productionTime =
    readString(row.production_time) ??
    readString(metadata.production_time) ??
    readString(metadata.production_time_label)

  return {
    ratingAvg: ratingAvg !== null ? Math.max(0, Math.min(5, ratingAvg)) : undefined,
    reviewsCount: reviewsCount !== null ? Math.max(0, Math.round(reviewsCount)) : undefined,
    productionTime,
  }
}

const parseDescription = (value: string): Product['description'] => {
  const long = value.trim()
  const firstLine =
    long
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? long

  const short = firstLine.length > 140 ? `${firstLine.slice(0, 137)}...` : firstLine

  return {
    short,
    long,
  }
}

const parseCategory = (row: ProductRow, categoriesById: Map<string, Category>): Category => {
  if (isCategory(row.category)) {
    return row.category
  }

  if (isCategory(row.category_id)) {
    return row.category_id
  }

  if (typeof row.category_id === 'string') {
    const fromMap = categoriesById.get(row.category_id)
    if (fromMap) {
      return fromMap
    }
  }

  return 'outros'
}

const withTimeout = async <T>(promiseLike: PromiseLike<T>, timeoutMs = 10000): Promise<T> => {
  return await new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Tempo limite ao consultar o Supabase.'))
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

const fallbackProducts: Product[] = PRODUCTS.map((product) => {
  const fallbackCategoryId = product.categoryId || product.category
  const fallbackCategoryIds = Array.from(new Set([fallbackCategoryId, ...(product.categoryIds ?? [])]))

  return {
    ...product,
    categoryId: fallbackCategoryId,
    categoryIds: fallbackCategoryIds,
    categoryName: product.categoryName || CATEGORY_LABELS[product.category],
  }
})

const normalizeProductRow = (
  row: ProductRow,
  categoriesById: Map<string, Category>,
  categoryNameById: Map<string, string>,
): Product | null => {
  const id = typeof row.id === 'string' ? row.id : null
  const name = typeof row.name === 'string' ? row.name : null
  const description = typeof row.description === 'string' ? row.description : null
  const price = Number(row.price)
  const minQuantity = Number(row.min_quantity)
  const categoryId = typeof row.category_id === 'string' ? row.category_id : undefined

  if (!id || !name || !description || Number.isNaN(price)) {
    return null
  }

  const images = parseStringArray(row.images)

  if (images.length === 0) {
    return null
  }

  const metadata = isRecord(row.metadata) ? row.metadata : {}
  const rawCategoryIds = parseStringArray(metadata.category_ids)
  const categoryIds = categoryId ? Array.from(new Set([categoryId, ...rawCategoryIds])) : rawCategoryIds

  return {
    id,
    name,
    description: parseDescription(description),
    category: parseCategory(row, categoriesById),
    categoryId,
    categoryIds,
    categoryName: categoryId ? categoryNameById.get(categoryId) : undefined,
    price,
    minQuantity: Number.isNaN(minQuantity) ? 1 : Math.max(1, Math.round(minQuantity)),
    images,
    tags: parseStringArray(row.tags),
    flags: parseFlags(row),
    variants: parseVariants(row.options),
    ...parseTrustSignals(row),
  }
}

const fetchProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured) {
    return fallbackProducts
  }

  try {
    const { data: categoryRows } = await withTimeout(supabase.from('categories').select('id, slug, name'))

    const categoriesById = new Map<string, Category>()
    const categoryNameById = new Map<string, string>()
    ;((categoryRows as CategoryRow[] | null) ?? []).forEach((row) => {
      if (typeof row.id === 'string' && typeof row.name === 'string') {
        categoryNameById.set(row.id, row.name)
      }

      if (typeof row.id === 'string' && isCategory(row.slug)) {
        categoriesById.set(row.id, row.slug)
      }
    })

    let requiresLocalAvailabilityFilter = false

    let { data: rows, error: queryError } = await withTimeout(
      supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false }),
    )

    if (queryError && queryError.message.toLowerCase().includes('is_available')) {
      const fallback = await withTimeout(supabase.from('products').select('*').order('created_at', { ascending: false }))
      rows = fallback.data
      queryError = fallback.error
      requiresLocalAvailabilityFilter = true
    }

    if (queryError) {
      throw new Error(queryError.message || 'Nao foi possivel buscar os produtos no Supabase.')
    }

    const normalized = (rows as ProductRow[] | null)
      ?.map((row) => normalizeProductRow(row, categoriesById, categoryNameById))
      .filter((item): item is Product => item !== null)

    return requiresLocalAvailabilityFilter
      ? (normalized ?? []).filter((product) => product.flags.isAvailable)
      : normalized ?? []
  } catch {
    return fallbackProducts
  }
}

export const useProducts = (): UseProductsResult => {
  const productsQuery = useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchProducts,
  })

  return {
    data: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error instanceof Error ? productsQuery.error.message : null,
  }
}
