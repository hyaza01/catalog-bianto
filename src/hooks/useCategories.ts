import { useCallback, useEffect, useRef, useState } from 'react'
import type { CategoryEntity } from '../@types'
import { supabase } from '../api/supabase'

const categoriesFeaturedLocalStorageKey = 'bianto-categories-featured-local'

interface UseCategoriesResult {
  categories: CategoryEntity[]
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
  createCategory: (params: { name: string; slug: string; isFeatured?: boolean }) => Promise<CategoryEntity>
  updateCategoryFeatured: (categoryId: string, isFeatured: boolean) => Promise<CategoryEntity>
  deleteCategoryById: (categoryId: string) => Promise<void>
}

const sortByName = (items: CategoryEntity[]): CategoryEntity[] =>
  [...items].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

type CategoryDbError = {
  code?: string | null
  message?: string | null
  details?: string | null
  hint?: string | null
}

interface CategoryRow {
  id: unknown
  slug: unknown
  name: unknown
  description?: unknown
  is_featured?: unknown
  created_at?: unknown
  updated_at?: unknown
}

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

const writeFeaturedOverrides = (nextOverrides: Record<string, boolean>) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(categoriesFeaturedLocalStorageKey, JSON.stringify(nextOverrides))
  } catch {
    // noop
  }
}

const normalizeCategoryRow = (row: CategoryRow, featuredOverrides: Record<string, boolean>): CategoryEntity | null => {
  if (typeof row.id !== 'string' || typeof row.slug !== 'string' || typeof row.name !== 'string') {
    return null
  }

  const featuredOverride = featuredOverrides[row.id]

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: typeof row.description === 'string' ? row.description : null,
    is_featured: featuredOverride ?? readBoolean(row.is_featured, false),
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
    updated_at: typeof row.updated_at === 'string' ? row.updated_at : undefined,
  }
}

const isMissingFeaturedColumnError = (errorLike: CategoryDbError | null | undefined): boolean => {
  const code = errorLike?.code ?? ''
  const message = errorLike?.message ?? ''
  const details = errorLike?.details ?? ''
  const hint = errorLike?.hint ?? ''
  const combined = `${message} ${details} ${hint} ${code}`.toLowerCase()

  return (
    code === '42703' ||
    /42703|pgrst204|is_featured|column|schema cache|could not find|does not exist|undefined column/.test(combined)
  )
}

const mapCategoriesError = (errorLike: CategoryDbError | string | null | undefined): string => {
  const normalizedError = typeof errorLike === 'string' ? { message: errorLike } : errorLike ?? {}

  const message = normalizedError.message ?? 'Nao foi possivel concluir a operacao em categorias.'
  const details = normalizedError.details ?? ''
  const code = normalizedError.code ?? ''
  const combined = `${message} ${details}`.toLowerCase()

  if (code === '23505' || /duplicate key|unique constraint|already exists/.test(combined)) {
    return 'Ja existe uma categoria com esse nome ou slug. Escolha outro nome.'
  }

  if (code === '23503' || /foreign key|constraint|referential/.test(combined)) {
    return 'Nao foi possivel excluir a categoria porque existem produtos vinculados a ela.'
  }

  if (code === '42501' || /row-level security|permission denied|policy/.test(combined)) {
    return 'Sem permissao para alterar categorias no Supabase (RLS). Rode o SQL em supabase/policies/categories_rls.sql para liberar o acesso do admin autenticado.'
  }

  if (code === '42703' || /is_featured|schema cache|could not find/.test(combined)) {
    return 'Coluna is_featured nao encontrada em categories. Rode o SQL em supabase/policies/categories_featured.sql para habilitar destaque por categoria.'
  }

  return message
}

export const useCategories = (): UseCategoriesResult => {
  const [categories, setCategories] = useState<CategoryEntity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const featuredColumnMissingRef = useRef(false)

  const applyFeaturedFallback = useCallback(async (categoryId: string, isFeatured: boolean): Promise<CategoryEntity> => {
    const overrides = readFeaturedOverrides()
    overrides[categoryId] = isFeatured
    writeFeaturedOverrides(overrides)

    let updatedCategory: CategoryEntity | null = null

    setCategories((current) =>
      sortByName(
        current.map((category) => {
          if (category.id !== categoryId) {
            return category
          }

          updatedCategory = {
            ...category,
            is_featured: isFeatured,
          }

          return updatedCategory
        }),
      ),
    )

    if (updatedCategory) {
      return updatedCategory
    }

    const selectAttempts = [
      'id, slug, name, description, created_at, updated_at',
      'id, slug, name, created_at, updated_at',
      'id, slug, name',
    ]

    for (const selectColumns of selectAttempts) {
      const { data: categorySnapshot, error: snapshotError } = await supabase
        .from('categories')
        .select(selectColumns)
        .eq('id', categoryId)
        .maybeSingle()

      if (snapshotError) {
        if (isMissingFeaturedColumnError(snapshotError)) {
          continue
        }

        throw new Error(mapCategoriesError(snapshotError))
      }

      if (!categorySnapshot) {
        break
      }

      const normalizedSnapshot = normalizeCategoryRow(
        {
          ...(categorySnapshot as unknown as CategoryRow),
          is_featured: isFeatured,
        },
        overrides,
      )

      if (normalizedSnapshot) {
        setCategories((current) =>
          sortByName([
            ...current.filter((category) => category.id !== categoryId),
            normalizedSnapshot,
          ]),
        )

        return normalizedSnapshot
      }
    }

    throw new Error('Categoria nao foi encontrada para atualizacao. Ela pode ter sido removida. Atualize a lista.')
  }, [])

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const featuredOverrides = readFeaturedOverrides()

    const { data, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (categoriesError) {
      setCategories([])
      setError(mapCategoriesError(categoriesError))
      setIsLoading(false)
      return
    }

    const normalized = ((data as CategoryRow[] | null) ?? [])
      .map((row) => normalizeCategoryRow(row, featuredOverrides))
      .filter((item): item is CategoryEntity => item !== null)

    setCategories(sortByName(normalized))
    setIsLoading(false)
  }, [])

  const createCategory = useCallback(async (params: {
    name: string
    slug: string
    isFeatured?: boolean
  }): Promise<CategoryEntity> => {
    setError(null)

    const featuredPayload = {
      name: params.name,
      slug: params.slug,
      is_featured: Boolean(params.isFeatured),
    }

    let createResult = await supabase.from('categories').insert(featuredPayload).select('*').single()
    let usedFeaturedFallback = false

    if (createResult.error && isMissingFeaturedColumnError(createResult.error)) {
      usedFeaturedFallback = true
      createResult = await supabase
        .from('categories')
        .insert({
          name: params.name,
          slug: params.slug,
        })
        .select('*')
        .single()
    }

    if (createResult.error || !createResult.data) {
      throw new Error(mapCategoriesError(createResult.error))
    }

    const overrides = readFeaturedOverrides()

    if (usedFeaturedFallback && typeof createResult.data.id === 'string') {
      overrides[createResult.data.id] = Boolean(params.isFeatured)
      writeFeaturedOverrides(overrides)
    }

    const createdCategory = normalizeCategoryRow(createResult.data as CategoryRow, overrides)

    if (!createdCategory) {
      throw new Error('Categoria criada, mas os dados retornados estao invalidos.')
    }

    setCategories((current) => sortByName([...current, createdCategory]))

    return createdCategory
  }, [])

  const updateCategoryFeatured = useCallback(
    async (categoryId: string, isFeatured: boolean): Promise<CategoryEntity> => {
      setError(null)

      if (featuredColumnMissingRef.current) {
        return applyFeaturedFallback(categoryId, isFeatured)
      }

      const { data, error: updateError } = await supabase
        .from('categories')
        .update({ is_featured: isFeatured })
        .eq('id', categoryId)
        .select('*')
        .single()

      if (updateError || !data) {
        const mappedUpdateError = mapCategoriesError(updateError)

        if (isMissingFeaturedColumnError(updateError) || mappedUpdateError.includes('Coluna is_featured')) {
          featuredColumnMissingRef.current = true
          return applyFeaturedFallback(categoryId, isFeatured)
        }

        throw new Error(mappedUpdateError)
      }

      featuredColumnMissingRef.current = false

      const overrides = readFeaturedOverrides()
      delete overrides[categoryId]
      writeFeaturedOverrides(overrides)

      const normalized = normalizeCategoryRow(data as CategoryRow, overrides)

      if (!normalized) {
        throw new Error('Categoria atualizada, mas os dados retornados estao invalidos.')
      }

      setCategories((current) => sortByName(current.map((category) => (category.id === categoryId ? normalized : category))))

      return normalized
    },
    [applyFeaturedFallback],
  )

  const deleteCategoryById = useCallback(async (categoryId: string): Promise<void> => {
    setError(null)

    const { error: deleteError } = await supabase.from('categories').delete().eq('id', categoryId)

    if (deleteError) {
      throw new Error(mapCategoriesError(deleteError))
    }

    const overrides = readFeaturedOverrides()
    if (Object.prototype.hasOwnProperty.call(overrides, categoryId)) {
      delete overrides[categoryId]
      writeFeaturedOverrides(overrides)
    }

    setCategories((current) => current.filter((category) => category.id !== categoryId))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void reload()
    }, 0)

    return () => {
      clearTimeout(timer)
    }
  }, [reload])

  return {
    categories,
    isLoading,
    error,
    reload,
    createCategory,
    updateCategoryFeatured,
    deleteCategoryById,
  }
}