import {
  AlertTriangle,
  Clock3,
  Globe,
  ImagePlus,
  LayoutList,
  Link as LinkIcon,
  LogOut,
  Mail,
  FolderTree,
  Pencil,
  Phone,
  PlusCircle,
  RefreshCw,
  Search,
  Settings2,
  Trash2,
  UploadCloud,
  XCircle,
} from 'lucide-react'
import type { ChangeEvent, DragEvent, FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../@types'
import { supabase } from '../api/supabase'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ProductImage } from '../components/common/ProductImage'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useCategories } from '../hooks/useCategories'
import { type SiteSettings, useSiteSettings } from '../hooks/useSiteSettings'
import { formatBRL, formatDatePtBr } from '../utils/format'
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants'

interface ProductInsertPayload {
  name: string
  slug: string
  description: string
  price: number
  category_id: string
  images: string[]
  min_quantity: number
  options: { colors?: string[]; sizes?: string[] } | null
  metadata: {
    is_available: boolean
    is_featured: boolean
    category_ids?: string[]
  }
  tags: string[]
}

interface ProductRow {
  id: unknown
  name: unknown
  slug: unknown
  description: unknown
  price: unknown
  category_id: unknown
  images: unknown
  min_quantity: unknown
  options: unknown
  metadata: unknown
  tags: unknown
  created_at?: unknown
  updated_at?: unknown
  is_available?: unknown
  is_featured?: unknown
}

interface ManagedProduct extends Product {
  created_at?: string
  updated_at?: string
}

interface HistoryEntry {
  id: string
  action: 'criado' | 'editado' | 'removido'
  productName: string
  timestamp: string
}

interface ProductDeletionHistoryEntry {
  id: string
  productId: string
  productName: string
  productSlug: string
  deletedBy: string
  deletedAt: string
}

interface DeleteCategoryDialogTarget {
  id: string
  name: string
  linkedProducts: number
}

type AdminTab = 'list' | 'new' | 'categories' | 'settings'
type AdminCategoryForm = {
  name: string
  isFeatured: boolean
}

const imageBucket = 'product-images'
const adminHistoryStorageKey = 'bianto-admin-product-history'
const productDeletionHistoryStorageKey = 'bianto-admin-product-deletion-history'

const fieldClassName =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5F6F5A]/35 focus:border-[#5F6F5A]'
const textAreaClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5F6F5A]/35 focus:border-[#5F6F5A]'
const cardClassName = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'
const buttonFocusClassName = 'focus-visible:ring-2 focus-visible:ring-[#5F6F5A]/35 focus-visible:ring-offset-2'

const parseCommaList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const makeHistoryId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parseStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

const readBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') {
    return value
  }

  return fallback
}

const parseOptions = (value: unknown): Product['options'] => {
  if (!isRecord(value)) {
    return null
  }

  const colors = parseStringArray(value.colors)
  const sizes = parseStringArray(value.sizes)

  if (colors.length === 0 && sizes.length === 0) {
    return null
  }

  return {
    ...(colors.length > 0 ? { colors } : {}),
    ...(sizes.length > 0 ? { sizes } : {}),
  }
}

const parseMetadata = (row: ProductRow): Product['metadata'] => {
  const metadata = isRecord(row.metadata) ? row.metadata : {}

  const is_available = readBoolean(row.is_available, readBoolean(metadata.is_available, true))
  const is_featured = readBoolean(row.is_featured, readBoolean(metadata.is_featured, false))

  return {
    is_available,
    is_featured,
  }
}

const normalizeProductRow = (row: ProductRow): ManagedProduct | null => {
  const id = typeof row.id === 'string' ? row.id : null
  const name = typeof row.name === 'string' ? row.name : null
  const slug = typeof row.slug === 'string' ? row.slug : null
  const description = typeof row.description === 'string' ? row.description : null
  const category_id = typeof row.category_id === 'string' ? row.category_id : null
  const price = Number(row.price)
  const min_quantity = Number(row.min_quantity)
  const images = parseStringArray(row.images)

  if (!id || !name || !slug || !description || !category_id || Number.isNaN(price)) {
    return null
  }

  const created_at = typeof row.created_at === 'string' ? row.created_at : undefined
  const updated_at = typeof row.updated_at === 'string' ? row.updated_at : undefined

  return {
    id,
    name,
    slug,
    description,
    price,
    category_id,
    images,
    min_quantity: Number.isNaN(min_quantity) ? 1 : Math.max(1, Math.round(min_quantity)),
    options: parseOptions(row.options),
    metadata: parseMetadata(row),
    tags: parseStringArray(row.tags),
    created_at,
    updated_at,
  }
}

const uploadProductImage = async (file: File, slug: string): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `products/${new Date().getFullYear()}/${slug}-${Date.now()}.${extension}`

  const { error: uploadError } = await supabase.storage.from(imageBucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from(imageBucket).getPublicUrl(path)

  if (!data.publicUrl) {
    throw new Error('Nao foi possivel gerar URL publica da imagem enviada.')
  }

  return data.publicUrl
}

const buildProductPayloadVariants = (payload: ProductInsertPayload): Record<string, unknown>[] => {
  const basePayload = {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    price: payload.price,
    category_id: payload.category_id,
    images: payload.images,
    min_quantity: payload.min_quantity,
    options: payload.options,
    tags: payload.tags,
  }

  return [
    {
      ...basePayload,
      metadata: payload.metadata,
      is_available: payload.metadata.is_available,
      is_featured: payload.metadata.is_featured,
    },
    {
      ...basePayload,
      is_available: payload.metadata.is_available,
      is_featured: payload.metadata.is_featured,
    },
    {
      ...basePayload,
      metadata: payload.metadata,
    },
    basePayload,
  ]
}

const isSchemaCompatibilityError = (message: string): boolean => {
  const normalized = message.toLowerCase()

  return (
    normalized.includes('schema cache') ||
    normalized.includes('could not find') ||
    normalized.includes('does not exist') ||
    normalized.includes('metadata') ||
    normalized.includes('is_available') ||
    normalized.includes('is_featured')
  )
}

const insertProductWithCompatibility = async (payload: ProductInsertPayload): Promise<Product> => {
  const payloadVariants = buildProductPayloadVariants(payload)
  let fallbackErrorMessage: string | null = null

  for (let index = 0; index < payloadVariants.length; index += 1) {
    const result = await supabase.from('products').insert(payloadVariants[index]).select('*').single()

    if (!result.error && result.data) {
      return result.data as Product
    }

    const currentErrorMessage = result.error?.message || 'Falha ao inserir produto no Supabase.'
    fallbackErrorMessage = currentErrorMessage

    if (!isSchemaCompatibilityError(currentErrorMessage)) {
      throw new Error(currentErrorMessage)
    }
  }

  throw new Error(fallbackErrorMessage || 'Falha ao inserir produto no Supabase.')
}

const updateProductWithCompatibility = async (id: string, payload: ProductInsertPayload): Promise<Product> => {
  const payloadVariants = buildProductPayloadVariants(payload)
  let fallbackErrorMessage: string | null = null

  for (let index = 0; index < payloadVariants.length; index += 1) {
    const result = await supabase
      .from('products')
      .update(payloadVariants[index])
      .eq('id', id)
      .select('*')
      .single()

    if (!result.error && result.data) {
      return result.data as Product
    }

    const currentErrorMessage = result.error?.message || 'Falha ao atualizar produto no Supabase.'
    fallbackErrorMessage = currentErrorMessage

    if (!isSchemaCompatibilityError(currentErrorMessage)) {
      throw new Error(currentErrorMessage)
    }
  }

  throw new Error(fallbackErrorMessage || 'Falha ao atualizar produto no Supabase.')
}

export const AdminPage = () => {
  const { user, signOut } = useAdminAuth()
  const {
    categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
    reload: reloadCategories,
    createCategory,
    updateCategoryFeatured,
    deleteCategoryById,
  } = useCategories()
  const {
    settings: siteSettings,
    isLoading: isLoadingSiteSettings,
    error: siteSettingsError,
    reload: reloadSiteSettings,
    saveSettings,
  } = useSiteSettings()

  const [activeTab, setActiveTab] = useState<AdminTab>('list')
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all')
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())

  // Bulk Edit States
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false)
  const [bulkEditCategoryId, setBulkEditCategoryId] = useState<string>('')
  const [bulkEditIsAvailable, setBulkEditIsAvailable] = useState<'unchanged' | 'true' | 'false'>('unchanged')
  const [bulkEditIsFeatured, setBulkEditIsFeatured] = useState<'unchanged' | 'true' | 'false'>('unchanged')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [extraCategoryIds, setExtraCategoryIds] = useState<string[]>([])
  const [minQuantity, setMinQuantity] = useState('1')
  const [tagsInput, setTagsInput] = useState('')
  const [colorsInput, setColorsInput] = useState('')
  const [sizesInput, setSizesInput] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')

  const [managedProducts, setManagedProducts] = useState<ManagedProduct[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [isDeletingProductId, setIsDeletingProductId] = useState<string | null>(null)
  const [deleteProductTarget, setDeleteProductTarget] = useState<ManagedProduct | null>(null)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<DeleteCategoryDialogTarget | null>(null)
  const [categoryForm, setCategoryForm] = useState<AdminCategoryForm>({ name: '', isFeatured: false })
  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettings>(siteSettings)
  const [isSavingCategory, setIsSavingCategory] = useState(false)
  const [isSavingSiteSettings, setIsSavingSiteSettings] = useState(false)
  const [isDeletingCategoryId, setIsDeletingCategoryId] = useState<string | null>(null)
  const [isUpdatingCategoryFeaturedId, setIsUpdatingCategoryFeaturedId] = useState<string | null>(null)
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [productDeletionHistory, setProductDeletionHistory] = useState<ProductDeletionHistoryEntry[]>([])
  const [localImagePreviewUrl, setLocalImagePreviewUrl] = useState<string | null>(null)
  const [isDragOverUpload, setIsDragOverUpload] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()

    categories.forEach((category) => {
      map.set(category.id, category.name)
    })

    return map
  }, [categories])

  const categoryUsageCountById = useMemo(() => {
    const map = new Map<string, number>()

    managedProducts.forEach((product) => {
      map.set(product.category_id, (map.get(product.category_id) ?? 0) + 1)
    })

    return map
  }, [managedProducts])

  useEffect(() => {
    if (categories.length === 0) {
      if (categoryId) {
        setCategoryId('')
      }
      return
    }

    const categoryStillExists = categories.some((category) => category.id === categoryId)

    if (!categoryId || !categoryStillExists) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])

  useEffect(() => {
    setSiteSettingsForm(siteSettings)
  }, [siteSettings])

  const selectedProduct = useMemo(
    () => managedProducts.find((product) => product.id === editingProductId) ?? null,
    [managedProducts, editingProductId],
  )

  const isEditMode = selectedProduct !== null

  const filteredProducts = useMemo(() => {
    let filtered = managedProducts

    if (filterCategoryId !== 'all') {
      filtered = filtered.filter((product) => {
        const metadataCategoryIds = isRecord(product.metadata) ? parseStringArray(product.metadata.category_ids) : []
        const productCategoryIds = Array.from(new Set([product.category_id, ...metadataCategoryIds]))
        return productCategoryIds.includes(filterCategoryId)
      })
    }

    const term = searchTerm.trim().toLowerCase()

    if (term.length === 0) {
      return filtered
    }

    return filtered.filter((product) => {
      const matchName = product.name.toLowerCase().includes(term)
      const matchSlug = product.slug.toLowerCase().includes(term)
      const matchCategory = (categoryNameById.get(product.category_id) ?? product.category_id).toLowerCase().includes(term)
      const matchTags = product.tags.some((tag) => tag.toLowerCase().includes(term))

      return matchName || matchSlug || matchCategory || matchTags
    })
  }, [categoryNameById, managedProducts, searchTerm, filterCategoryId])

  const appendHistory = useCallback((action: HistoryEntry['action'], productName: string) => {
    setHistoryEntries((current) => [
      {
        id: makeHistoryId(),
        action,
        productName,
        timestamp: new Date().toISOString(),
      },
      ...current,
    ].slice(0, 20))
  }, [])

  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true)

    const { data, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (productsError) {
      setManagedProducts([])
      setError(productsError.message || 'Nao foi possivel carregar produtos cadastrados.')
      setIsLoadingProducts(false)
      return
    }

    const normalized = ((data as ProductRow[] | null) ?? [])
      .map((row) => normalizeProductRow(row))
      .filter((item): item is ManagedProduct => item !== null)

    setManagedProducts(normalized)
    setIsLoadingProducts(false)
  }, [])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (!imageFile) {
      setLocalImagePreviewUrl(null)
      return
    }

    const previewUrl = URL.createObjectURL(imageFile)
    setLocalImagePreviewUrl(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [imageFile])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const rawValue = window.localStorage.getItem(adminHistoryStorageKey)

      if (!rawValue) {
        return
      }

      const parsed = JSON.parse(rawValue)

      if (!Array.isArray(parsed)) {
        return
      }

      const sanitized = parsed
        .filter((item): item is HistoryEntry => {
          if (!isRecord(item)) {
            return false
          }

          return (
            typeof item.id === 'string' &&
            (item.action === 'criado' || item.action === 'editado' || item.action === 'removido') &&
            typeof item.productName === 'string' &&
            typeof item.timestamp === 'string'
          )
        })
        .slice(0, 20)

      setHistoryEntries(sanitized)
    } catch {
      setHistoryEntries([])
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const rawValue = window.localStorage.getItem(productDeletionHistoryStorageKey)

      if (!rawValue) {
        return
      }

      const parsed = JSON.parse(rawValue)

      if (!Array.isArray(parsed)) {
        return
      }

      const sanitized = parsed
        .filter((item): item is ProductDeletionHistoryEntry => {
          if (!isRecord(item)) {
            return false
          }

          return (
            typeof item.id === 'string' &&
            typeof item.productId === 'string' &&
            typeof item.productName === 'string' &&
            typeof item.productSlug === 'string' &&
            typeof item.deletedBy === 'string' &&
            typeof item.deletedAt === 'string'
          )
        })
        .slice(0, 100)

      setProductDeletionHistory(sanitized)
    } catch {
      setProductDeletionHistory([])
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(adminHistoryStorageKey, JSON.stringify(historyEntries))
  }, [historyEntries])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(productDeletionHistoryStorageKey, JSON.stringify(productDeletionHistory))
  }, [productDeletionHistory])

  const slugPreview = useMemo(() => {
    const generated = slugify(slug.trim() || name.trim())
    return generated.length > 0 ? generated : 'sera-gerado-com-base-no-nome'
  }, [name, slug])

  const categorySlugPreview = useMemo(() => {
    const generated = slugify(categoryForm.name)
    return generated.length > 0 ? generated : 'slug-da-categoria'
  }, [categoryForm.name])

  const previewPrice = useMemo(() => {
    const value = Number(price)
    return Number.isFinite(value) ? formatBRL(value) : 'R$ 0,00'
  }, [price])

  const previewDescription = useMemo(() => {
    const text = description.trim()

    if (!text) {
      return 'Descricao curta do produto para visualizacao no card do catalogo.'
    }

    const firstLine =
      text
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.length > 0) ?? text

    return firstLine.length > 120 ? `${firstLine.slice(0, 117)}...` : firstLine
  }, [description])

  const previewImage = useMemo(() => {
    const fromLocalFile = localImagePreviewUrl?.trim()
    const fromInputUrl = imageUrl.trim()
    const fromSelectedProduct = selectedProduct?.images[0]

    return fromLocalFile || fromInputUrl || fromSelectedProduct || DEFAULT_PRODUCT_IMAGE
  }, [imageUrl, localImagePreviewUrl, selectedProduct])

  const previewTags = useMemo(() => parseCommaList(tagsInput), [tagsInput])

  const previewCategoryName = useMemo(() => {
    if (!categoryId) {
      return 'Sem categoria'
    }

    return categoryNameById.get(categoryId) ?? 'Sem categoria'
  }, [categoryId, categoryNameById])

  const clearFeedback = () => {
    setError(null)
    setMessage(null)
  }

  const resetForm = useCallback(() => {
    setName('')
    setSlug('')
    setDescription('')
    setPrice('')
    setMinQuantity('1')
    setTagsInput('')
    setColorsInput('')
    setSizesInput('')
    setIsAvailable(true)
    setIsFeatured(false)
    setExtraCategoryIds([])
    setImageFile(null)
    setImageUrl('')
    setEditingProductId(null)
    setCategoryId(categories[0]?.id ?? '')
    setSelectedProductIds(new Set())
  }, [categories])

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setImageFile(file)
  }

  const handleDropUpload = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragOverUpload(false)

    const file = event.dataTransfer.files?.[0] ?? null

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Selecione apenas arquivos de imagem para upload.')
      return
    }

    clearFeedback()
    setImageFile(file)
  }

  const handleStartEdit = (product: ManagedProduct) => {
    clearFeedback()
    setEditingProductId(product.id)
    setName(product.name)
    setSlug(product.slug)
    setDescription(product.description)
    setPrice(String(product.price))
    setCategoryId(product.category_id)
    const metadataCategoryIds = isRecord(product.metadata) ? parseStringArray(product.metadata.category_ids) : []
    setExtraCategoryIds(metadataCategoryIds.filter(id => id !== product.category_id))
    setMinQuantity(String(product.min_quantity))
    setTagsInput(product.tags.join(', '))
    setColorsInput(product.options?.colors?.join(', ') ?? '')
    setSizesInput(product.options?.sizes?.join(', ') ?? '')
    setIsAvailable(product.metadata.is_available)
    setIsFeatured(product.metadata.is_featured)
    setImageFile(null)
    setImageUrl(product.images[0] ?? '')
    setActiveTab('new')
    setMessage(`Editando produto: ${product.name}`)
  }

  const handleCancelEdit = () => {
    clearFeedback()
    resetForm()
    setActiveTab('list')
  }

  const handleDeleteSelected = async () => {
    if (selectedProductIds.size === 0) return
    
    if (!window.confirm(`Deseja realmente remover os ${selectedProductIds.size} produtos selecionados? ESSA ACAO E IRREVERSIVEL.`)) {
      return
    }

    setIsSubmitting(true)
    clearFeedback()

    try {
      const idsToDelete = Array.from(selectedProductIds)
      
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .in('id', idsToDelete)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      appendHistory('removido', `${selectedProductIds.size} produtos em lote`)
      setMessage(`${selectedProductIds.size} produtos removidos com sucesso.`)
      setSelectedProductIds(new Set())
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover produtos. Tente novamente mais tarde.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (selectedProductIds.size === 0) return

    setIsSubmitting(true)
    clearFeedback()

    try {
      let count = 0
      for (const id of Array.from(selectedProductIds)) {
        const product = managedProducts.find(p => p.id === id)
        if (!product) continue

        const is_available = bulkEditIsAvailable === 'unchanged' ? product.metadata.is_available : bulkEditIsAvailable === 'true'
        const is_featured = bulkEditIsFeatured === 'unchanged' ? product.metadata.is_featured : bulkEditIsFeatured === 'true'
        const category_id = bulkEditCategoryId || product.category_id

        const colors = product.options?.colors ?? []
        const sizes = product.options?.sizes ?? []
        const options = colors.length > 0 || sizes.length > 0 ? {
          ...(colors.length > 0 ? { colors } : {}),
          ...(sizes.length > 0 ? { sizes } : {}),
        } : null

        const payload: ProductInsertPayload = {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          category_id,
          images: product.images,
          min_quantity: product.min_quantity,
          options,
          metadata: {
            ...product.metadata,
            category_ids: Array.isArray(product.metadata.category_ids) ? product.metadata.category_ids : [],
            is_available,
            is_featured,
          },
          tags: product.tags,
        }

        await updateProductWithCompatibility(product.id, payload)
        count++
      }

      appendHistory('editado', `${count} produtos em lote`)
      setMessage(`${count} produtos alterados com sucesso.`)
      
      setBulkEditCategoryId('')
      setBulkEditIsAvailable('unchanged')
      setBulkEditIsFeatured('unchanged')
      setIsBulkEditModalOpen(false)
      setSelectedProductIds(new Set())
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao aplicar edicao em lote.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateOrUpdateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSubmitting(true)
    clearFeedback()

    try {
      const cleanName = name.trim()
      const cleanDescription = description.trim()
      const normalizedSlug = slugify(slug.trim() || cleanName)
      const parsedPrice = Number(price)
      const parsedMinQuantity = Math.max(1, Math.round(Number(minQuantity)))

      if (!cleanName || !cleanDescription || !normalizedSlug || !categoryId || !Number.isFinite(parsedPrice)) {
        throw new Error('Preencha os campos obrigatorios corretamente.')
      }

      let imageFinalUrl = imageUrl.trim()

      if (!imageFinalUrl && imageFile) {
        imageFinalUrl = await uploadProductImage(imageFile, normalizedSlug)
      }

      if (!imageFinalUrl && selectedProduct?.images[0]) {
        imageFinalUrl = selectedProduct.images[0]
      }

      if (!imageFinalUrl) {
        throw new Error('Informe uma URL de imagem ou envie um arquivo para upload.')
      }

      const tags = parseCommaList(tagsInput)
      const colors = parseCommaList(colorsInput)
      const sizes = parseCommaList(sizesInput)

      const options =
        colors.length > 0 || sizes.length > 0
          ? {
              ...(colors.length > 0 ? { colors } : {}),
              ...(sizes.length > 0 ? { sizes } : {}),
            }
          : null

      const payload: ProductInsertPayload = {
        name: cleanName,
        slug: normalizedSlug,
        description: cleanDescription,
        price: parsedPrice,
        category_id: categoryId,
        images: [imageFinalUrl],
        min_quantity: parsedMinQuantity,
        options,
        metadata: {
          is_available: isAvailable,
          is_featured: isFeatured,
          category_ids: Array.from(new Set([categoryId, ...extraCategoryIds]))
        },
        tags,
      }

      if (isEditMode && selectedProduct) {
        const updatedProduct = await updateProductWithCompatibility(selectedProduct.id, payload)
        appendHistory('editado', updatedProduct.name)
        setMessage(`Produto atualizado com sucesso: ${updatedProduct.name}`)
        setActiveTab('list')
      } else {
        const insertedProduct = await insertProductWithCompatibility(payload)
        appendHistory('criado', insertedProduct.name)
        setMessage(`Produto criado com sucesso: ${insertedProduct.name}`)
      }

      await loadProducts()
      resetForm()
    } catch (creationError) {
      const messageFromError = creationError instanceof Error ? creationError.message : 'Erro inesperado.'
      setError(messageFromError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteProductModal = (product: ManagedProduct) => {
    clearFeedback()
    setDeleteProductTarget(product)
  }

  const closeDeleteProductModal = () => {
    if (isDeletingProductId) {
      return
    }

    setDeleteProductTarget(null)
  }

  const confirmDeleteProduct = async () => {
    if (!deleteProductTarget) {
      return
    }

    setIsDeletingProductId(deleteProductTarget.id)
    clearFeedback()

    try {
      const { error: deleteError } = await supabase.from('products').delete().eq('id', deleteProductTarget.id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      appendHistory('removido', deleteProductTarget.name)
      setProductDeletionHistory((current) => [
        {
          id: makeHistoryId(),
          productId: deleteProductTarget.id,
          productName: deleteProductTarget.name,
          productSlug: deleteProductTarget.slug,
          deletedBy: user?.email ?? 'admin',
          deletedAt: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 100))

      setMessage(`Produto removido: ${deleteProductTarget.name}`)

      if (editingProductId === deleteProductTarget.id) {
        resetForm()
      }

      setDeleteProductTarget(null)
      await loadProducts()
    } catch (deleteFailure) {
      const messageFromError = deleteFailure instanceof Error ? deleteFailure.message : 'Erro ao remover produto.'
      setError(messageFromError)
    } finally {
      setIsDeletingProductId(null)
    }
  }

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSavingCategory(true)
    clearFeedback()

    try {
      const cleanName = categoryForm.name.trim()
      const generatedSlug = slugify(cleanName)
      const normalizedName = cleanName.toLocaleLowerCase('pt-BR')

      if (!cleanName || !generatedSlug) {
        throw new Error('Informe um nome valido para a categoria.')
      }

      const categoryWithSameName = categories.some(
        (category) => category.name.trim().toLocaleLowerCase('pt-BR') === normalizedName,
      )

      const categoryWithSameSlug = categories.some(
        (category) => category.slug.trim().toLocaleLowerCase('pt-BR') === generatedSlug.toLocaleLowerCase('pt-BR'),
      )

      if (categoryWithSameName || categoryWithSameSlug) {
        throw new Error('Essa categoria ja existe. Escolha outro nome.')
      }

      const createdCategory = await createCategory({
        name: cleanName,
        slug: generatedSlug,
        isFeatured: categoryForm.isFeatured,
      })

      setCategoryForm({ name: '', isFeatured: false })
      setCategoryId((current) => current || createdCategory.id)
      setMessage(`Categoria salva com sucesso: ${createdCategory.name}`)
    } catch (categoryCreationError) {
      const categoryMessage =
        categoryCreationError instanceof Error ? categoryCreationError.message : 'Erro ao salvar categoria.'
      setError(categoryMessage)
    } finally {
      setIsSavingCategory(false)
    }
  }

  const handleToggleCategoryFeatured = async (categoryId: string, isFeatured: boolean) => {
    setIsUpdatingCategoryFeaturedId(categoryId)
    clearFeedback()

    try {
      const updatedCategory = await updateCategoryFeatured(categoryId, isFeatured)
      setMessage(
        isFeatured
          ? `Categoria marcada como destaque: ${updatedCategory.name}`
          : `Categoria removida do destaque: ${updatedCategory.name}`,
      )
    } catch (categoryFeaturedError) {
      const featuredMessage =
        categoryFeaturedError instanceof Error
          ? categoryFeaturedError.message
          : 'Erro ao atualizar destaque da categoria.'
      setError(featuredMessage)
    } finally {
      setIsUpdatingCategoryFeaturedId(null)
    }
  }

  const openDeleteCategoryModal = (categoryIdToDelete: string, categoryName: string) => {
    clearFeedback()
    setDeleteCategoryTarget({
      id: categoryIdToDelete,
      name: categoryName,
      linkedProducts: managedProducts.filter((product) => product.category_id === categoryIdToDelete).length,
    })
  }

  const closeDeleteCategoryModal = () => {
    if (isDeletingCategoryId) {
      return
    }

    setDeleteCategoryTarget(null)
  }

  const ensureFallbackCategory = async (categoryIdToDelete: string): Promise<{ id: string; name: string }> => {
    const preferredFallback = categories.find(
      (category) =>
        category.id !== categoryIdToDelete &&
        (category.slug.toLocaleLowerCase('pt-BR') === 'sem-categoria' ||
          category.slug.toLocaleLowerCase('pt-BR') === 'outros'),
    )

    if (preferredFallback) {
      return {
        id: preferredFallback.id,
        name: preferredFallback.name,
      }
    }

    const firstAvailableFallback = categories.find((category) => category.id !== categoryIdToDelete)

    if (firstAvailableFallback) {
      return {
        id: firstAvailableFallback.id,
        name: firstAvailableFallback.name,
      }
    }

    const createdFallback = await createCategory({
      name: 'Categoria geral',
      slug: `categoria-geral-${Date.now().toString(36)}`,
      isFeatured: false,
    })

    return {
      id: createdFallback.id,
      name: createdFallback.name,
    }
  }

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryTarget) {
      return
    }

    setIsDeletingCategoryId(deleteCategoryTarget.id)
    clearFeedback()

    try {
      let fallbackCategoryName: string | null = null
      let fallbackCategoryId: string | null = null

      if (deleteCategoryTarget.linkedProducts > 0) {
        const fallbackCategory = await ensureFallbackCategory(deleteCategoryTarget.id)
        fallbackCategoryName = fallbackCategory.name
        fallbackCategoryId = fallbackCategory.id

        const { error: moveProductsError } = await supabase
          .from('products')
          .update({ category_id: fallbackCategory.id })
          .eq('category_id', deleteCategoryTarget.id)

        if (moveProductsError) {
          throw new Error(moveProductsError.message)
        }
      }

      await deleteCategoryById(deleteCategoryTarget.id)

      setCategoryId((current) => {
        if (current !== deleteCategoryTarget.id) {
          return current
        }

        return fallbackCategoryId ?? ''
      })

      if (deleteCategoryTarget.linkedProducts > 0 && fallbackCategoryName) {
        setMessage(
          `Categoria removida: ${deleteCategoryTarget.name}. A categoria foi removida de ${deleteCategoryTarget.linkedProducts} produto(s) e movida para ${fallbackCategoryName}.`,
        )
      } else {
        setMessage(`Categoria removida: ${deleteCategoryTarget.name}`)
      }

      setDeleteCategoryTarget(null)
      await loadProducts()
    } catch (categoryDeleteError) {
      const categoryMessage =
        categoryDeleteError instanceof Error ? categoryDeleteError.message : 'Erro ao excluir categoria.'

      if (/foreign|constraint|violates|referential/i.test(categoryMessage)) {
        setError('Nao foi possivel excluir a categoria porque existem produtos vinculados a ela.')
      } else {
        setError(categoryMessage)
      }
    } finally {
      setIsDeletingCategoryId(null)
    }
  }

  const handleSiteSettingsChange = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSiteSettingsForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleSaveSiteSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSavingSiteSettings(true)
    clearFeedback()

    try {
      const normalized: SiteSettings = {
        whatsappNumber: siteSettingsForm.whatsappNumber.trim(),
        contactPhone: siteSettingsForm.contactPhone.trim(),
        contactEmail: siteSettingsForm.contactEmail.trim(),
        instagramUrl: siteSettingsForm.instagramUrl.trim(),
        facebookUrl: siteSettingsForm.facebookUrl.trim(),
        linkedinUrl: siteSettingsForm.linkedinUrl.trim(),
        youtubeUrl: siteSettingsForm.youtubeUrl.trim(),
        websiteUrl: siteSettingsForm.websiteUrl.trim(),
        supportLink: siteSettingsForm.supportLink.trim(),
      }

      await saveSettings(normalized)
      setSiteSettingsForm(normalized)
      setMessage('Configuracoes do site salvas com sucesso.')
    } catch (siteSettingsSaveError) {
      const errorMessage =
        siteSettingsSaveError instanceof Error
          ? siteSettingsSaveError.message
          : 'Nao foi possivel salvar as configuracoes do site.'
      setError(errorMessage)
    } finally {
      setIsSavingSiteSettings(false)
    }
  }

  const handleClearHistory = () => {
    setHistoryEntries([])
  }

  const handleClearProductDeletionHistory = () => {
    setProductDeletionHistory([])
  }

  const isDeleteDialogOpen = deleteProductTarget !== null || deleteCategoryTarget !== null
  const isDeleteDialogBusy = Boolean(isDeletingProductId || isDeletingCategoryId)

  const handleCloseDeleteDialog = () => {
    if (isDeleteDialogBusy) {
      return
    }

    closeDeleteProductModal()
    closeDeleteCategoryModal()
  }

  const handleConfirmDeleteDialog = () => {
    if (deleteProductTarget) {
      void confirmDeleteProduct()
      return
    }

    if (deleteCategoryTarget) {
      void confirmDeleteCategory()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className={`${cardClassName}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Painel administrativo</p>
              <h1 className="font-display text-4xl text-[#2B2B2B]">Cadastro de Produtos</h1>
              <p className="mt-1 text-sm text-slate-600">Logado como: {user?.email ?? 'admin'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-[#2B2B2B]/30 hover:text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#5F6F5A]/35 focus:ring-offset-2"
              >
                Ver site
              </Link>
              <Button
                variant="outline"
                onClick={() => void signOut()}
                aria-label="Sair do painel administrativo"
                className={buttonFocusClassName}
              >
                <LogOut size={16} aria-hidden="true" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        <section className={`${cardClassName} p-2`}>
          <div className="grid gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5F6F5A]/35 focus:ring-offset-2 ${
                activeTab === 'list'
                  ? 'border-[#2B2B2B] bg-[#2B2B2B] text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <LayoutList size={16} aria-hidden="true" />
              Produtos Cadastrados
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5F6F5A]/35 focus:ring-offset-2 ${
                activeTab === 'new'
                  ? 'border-[#2B2B2B] bg-[#2B2B2B] text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <PlusCircle size={16} aria-hidden="true" />
              Novo Produto
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5F6F5A]/35 focus:ring-offset-2 ${
                activeTab === 'categories'
                  ? 'border-[#2B2B2B] bg-[#2B2B2B] text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <FolderTree size={16} aria-hidden="true" />
              Categorias
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5F6F5A]/35 focus:ring-offset-2 ${
                activeTab === 'settings'
                  ? 'border-[#2B2B2B] bg-[#2B2B2B] text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <Settings2 size={16} aria-hidden="true" />
              Configuracoes
            </button>
          </div>
        </section>

        {(error || message) && (
          <section className={`${cardClassName} space-y-2`}>
            {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{message}</p>}
          </section>
        )}

        {activeTab === 'list' && (
          <section className="space-y-6">
            <section className={`${cardClassName}`}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-display text-3xl text-[#2B2B2B]">Produtos Cadastrados</h2>
                  <p className="mt-1 text-sm text-slate-600">Busque, edite ou remova produtos existentes.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void loadProducts()}
                  aria-label="Atualizar lista de produtos"
                  className={buttonFocusClassName}
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  Atualizar lista
                </Button>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_minmax(180px,auto)_auto] lg:items-center">
                <label className="relative block" htmlFor="products-search">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="products-search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    aria-label="Buscar produto para editar ou remover"
                    placeholder="Buscar por nome, slug, categoria ou tag"
                    className={`${fieldClassName} pl-10`}
                  />
                </label>
                
                <select
                  aria-label="Filtrar por categoria"
                  value={filterCategoryId}
                  onChange={(e) => setFilterCategoryId(e.target.value)}
                  className={fieldClassName}
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                <div className="flex flex-col gap-1 items-end sm:flex-row sm:items-center">
                  {selectedProductIds.size > 0 ? (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsBulkEditModalOpen(true)}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5"
                      >
                        <Pencil size={14} />
                        Editar ({selectedProductIds.size})
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteSelected}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 size={14} />
                        Excluir ({selectedProductIds.size})
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">{filteredProducts.length} itens encontrados</p>
                  )}
                </div>
              </div>

              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 bg-white">
                  <thead className="bg-slate-100/70">
                    <tr>
                      <th className="px-4 py-3 text-left w-10">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-[#5F6F5A] focus:ring-[#5F6F5A]"
                          checked={filteredProducts.length > 0 && selectedProductIds.size === filteredProducts.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProductIds(new Set(filteredProducts.map(p => p.id)))
                            } else {
                              setSelectedProductIds(new Set())
                            }
                          }}
                          aria-label="Selecionar todos os produtos"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Imagem</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Produto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Categoria</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Preco</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingProducts && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                          Carregando produtos...
                        </td>
                      </tr>
                    )}

                    {!isLoadingProducts && filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                          Nenhum produto encontrado com esse termo e categoria.
                        </td>
                      </tr>
                    )}

                    {!isLoadingProducts &&
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-[#5F6F5A] focus:ring-[#5F6F5A]"
                              checked={selectedProductIds.has(product.id)}
                              onChange={(e) => {
                                const newSet = new Set(selectedProductIds)
                                if (e.target.checked) {
                                  newSet.add(product.id)
                                } else {
                                  newSet.delete(product.id)
                                }
                                setSelectedProductIds(newSet)
                              }}
                              aria-label={`Selecionar ${product.name}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <ProductImage
                              src={product.images[0]}
                              alt={`Imagem de ${product.name}`}
                              className="h-10 w-10 rounded-lg object-contain"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-[#2B2B2B]">{product.name}</p>
                            <p className="text-xs text-slate-500">/{product.slug}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {categoryNameById.get(product.category_id) ?? 'Sem categoria'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-[#2B2B2B]">{formatBRL(product.price)}</td>
                          <td className="px-4 py-3">
                            {product.metadata.is_available ? (
                              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                Disponivel
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                Indisponivel
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartEdit(product)}
                                aria-label={`Editar ${product.name}`}
                                className={buttonFocusClassName}
                              >
                                <Pencil size={14} aria-hidden="true" />
                                Editar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isDeletingProductId === product.id}
                                onClick={() => openDeleteProductModal(product)}
                                aria-label={`Remover ${product.name}`}
                                className={`border-[#5F6F5A]/40 text-[#5F6F5A] hover:border-[#5F6F5A] hover:text-[#5F6F5A] ${buttonFocusClassName}`}
                              >
                                <Trash2 size={14} aria-hidden="true" />
                                {isDeletingProductId === product.id ? 'Removendo...' : 'Remover'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={`${cardClassName}`}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-2xl text-[#2B2B2B]">Historico de acoes</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearHistory}
                  disabled={historyEntries.length === 0}
                  aria-label="Limpar historico de acoes"
                  className={buttonFocusClassName}
                >
                  Limpar
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {historyEntries.length === 0 && (
                  <p className="text-sm text-slate-500">As acoes de criar, editar e remover aparecerao aqui.</p>
                )}
                {historyEntries.map((entry) => (
                  <article key={entry.id} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm font-medium text-[#2B2B2B]">
                      Produto <span className="font-semibold">{entry.action}</span>: {entry.productName}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                      <Clock3 size={12} aria-hidden="true" />
                      {formatDatePtBr(new Date(entry.timestamp))}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className={`${cardClassName}`}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-2xl text-[#2B2B2B]">Historico de delecao de produtos</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearProductDeletionHistory}
                  disabled={productDeletionHistory.length === 0}
                  aria-label="Limpar historico de delecao de produtos"
                  className={buttonFocusClassName}
                >
                  Limpar
                </Button>
              </div>

              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 bg-white">
                  <thead className="bg-slate-100/70">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Produto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Slug</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Excluido por</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Data e hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {productDeletionHistory.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                          Nenhuma delecao registrada.
                        </td>
                      </tr>
                    )}

                    {productDeletionHistory.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 text-sm font-medium text-[#2B2B2B]">{entry.productName}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">/{entry.productSlug}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{entry.deletedBy}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDatePtBr(new Date(entry.deletedAt))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        )}

        {activeTab === 'new' && (
          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className={`${cardClassName}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-3xl text-[#2B2B2B]">{isEditMode ? 'Editar produto' : 'Novo produto'}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {isEditMode
                      ? 'Atualize os campos desejados e salve as alteracoes.'
                      : 'Preencha as secoes abaixo para cadastrar um novo produto.'}
                  </p>
                </div>
                {isEditMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    aria-label="Cancelar modo de edicao"
                    className={buttonFocusClassName}
                  >
                    <XCircle size={14} aria-hidden="true" />
                    Cancelar edicao
                  </Button>
                )}
              </div>

              <form className="mt-5 space-y-5" onSubmit={handleCreateOrUpdateProduct}>
                <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                  <legend className="px-2 text-sm font-semibold text-[#2B2B2B]">Informacoes Basicas</legend>
                  <div className="mt-2 grid gap-4">
                    <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="product-name">
                      Nome
                      <input
                        id="product-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                        aria-label="Nome do produto"
                        className={fieldClassName}
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="product-slug">
                      Slug (opcional)
                      <input
                        id="product-slug"
                        value={slug}
                        onChange={(event) => setSlug(event.target.value)}
                        aria-label="Slug do produto"
                        placeholder="Deixe vazio para gerar automaticamente"
                        className={fieldClassName}
                      />
                      <span className="text-xs text-slate-500">Slug final: {slugPreview}</span>
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="product-description">
                      Descricao
                      <textarea
                        id="product-description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        required
                        rows={4}
                        aria-label="Descricao do produto"
                        className={textAreaClassName}
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="product-category">
                      Categoria
                      <select
                        id="product-category"
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value)}
                        required
                        disabled={isLoadingCategories || categories.length === 0}
                        aria-label="Categoria do produto"
                        className={fieldClassName}
                      >
                        <option value="">
                          {isLoadingCategories ? 'Carregando categorias...' : 'Selecione uma categoria'}
                        </option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    {categoryId && categories.length > 1 && (
                      <div className="grid gap-2">
                        <span className="text-sm font-medium text-slate-700">Categorias adicionais (opcional)</span>
                        <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">
                          {categories
                            .filter((category) => category.id !== categoryId)
                            .map((category) => (
                              <label
                                key={`extra-cat-${category.id}`}
                                className="flex cursor-pointer text-sm text-slate-700 hover:text-slate-900"
                              >
                                <input
                                  type="checkbox"
                                  className="mr-2 mt-[2px] h-4 w-4 shrink-0 rounded border-slate-300 text-[#5F6F5A] focus:ring-[#5F6F5A]"
                                  checked={extraCategoryIds.includes(category.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setExtraCategoryIds((curr) => [...curr, category.id])
                                    } else {
                                      setExtraCategoryIds((curr) => curr.filter((id) => id !== category.id))
                                    }
                                  }}
                                />
                                <span className="line-clamp-1">{category.name}</span>
                              </label>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500">
                          Selecione outras sessoes ondes este produto deve aparecer.
                        </p>
                      </div>
                    )}

                    {categoriesError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <p>Falha ao carregar categorias: {categoriesError}</p>
                        <button
                          type="button"
                          onClick={() => void reloadCategories()}
                          className="mt-2 inline-flex items-center rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold transition-all duration-200 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          Tentar novamente
                        </button>
                      </div>
                    )}
                  </div>
                </fieldset>

                <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                  <legend className="px-2 text-sm font-semibold text-[#2B2B2B]">Preco & Estoque</legend>
                  <div className="mt-2 grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="product-price">
                      Preco
                      <input
                        id="product-price"
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        required
                        aria-label="Preco do produto"
                        className={fieldClassName}
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="product-min-quantity">
                      Quantidade minima
                      <input
                        id="product-min-quantity"
                        type="number"
                        min="1"
                        value={minQuantity}
                        onChange={(event) => setMinQuantity(event.target.value)}
                        required
                        aria-label="Quantidade minima de pedido"
                        className={fieldClassName}
                      />
                    </label>
                  </div>
                </fieldset>

                <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                  <legend className="px-2 text-sm font-semibold text-[#2B2B2B]">Midia</legend>
                  <div className="mt-2 grid gap-4">
                    <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="product-image-url">
                      URL da imagem (opcional)
                      <input
                        id="product-image-url"
                        value={imageUrl}
                        onChange={(event) => setImageUrl(event.target.value)}
                        aria-label="URL da imagem do produto"
                        placeholder="https://..."
                        className={fieldClassName}
                      />
                    </label>

                    <label
                      htmlFor="product-image-file"
                      onDragOver={(event) => {
                        event.preventDefault()
                        setIsDragOverUpload(true)
                      }}
                      onDragLeave={() => setIsDragOverUpload(false)}
                      onDrop={handleDropUpload}
                      className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200 focus-within:ring-2 focus-within:ring-[#5F6F5A]/35 ${
                        isDragOverUpload
                          ? 'border-[#5F6F5A] bg-[#5F6F5A]/5'
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      <input
                        id="product-image-file"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        aria-label="Enviar arquivo de imagem do produto"
                        className="sr-only"
                      />
                      <UploadCloud size={22} className="text-slate-500" aria-hidden="true" />
                      <p className="mt-2 text-sm font-medium text-[#2B2B2B]">Arraste e solte ou clique para enviar</p>
                      <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP - bucket: product-images</p>
                      {imageFile && (
                        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          <ImagePlus size={12} aria-hidden="true" />
                          {imageFile.name}
                        </p>
                      )}
                    </label>
                  </div>
                </fieldset>

                <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                  <legend className="px-2 text-sm font-semibold text-[#2B2B2B]">Opcoes & Visibilidade</legend>
                  <div className="mt-2 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="product-tags">
                        Tags
                        <input
                          id="product-tags"
                          value={tagsInput}
                          onChange={(event) => setTagsInput(event.target.value)}
                          aria-label="Tags do produto"
                          placeholder="premium, evento, corporativo"
                          className={fieldClassName}
                        />
                      </label>

                      <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="product-colors">
                        Cores
                        <input
                          id="product-colors"
                          value={colorsInput}
                          onChange={(event) => setColorsInput(event.target.value)}
                          aria-label="Cores do produto"
                          placeholder="branco, preto"
                          className={fieldClassName}
                        />
                      </label>

                      <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="product-sizes">
                        Tamanhos
                        <input
                          id="product-sizes"
                          value={sizesInput}
                          onChange={(event) => setSizesInput(event.target.value)}
                          aria-label="Tamanhos do produto"
                          placeholder="350ml, 500ml"
                          className={fieldClassName}
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                        Produto disponivel
                        <input
                          type="checkbox"
                          checked={isAvailable}
                          onChange={(event) => setIsAvailable(event.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#5F6F5A] transition-all duration-200 focus:ring-[#5F6F5A]"
                          aria-label="Produto disponivel"
                        />
                      </label>

                      <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                        Produto em destaque
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(event) => setIsFeatured(event.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#5F6F5A] transition-all duration-200 focus:ring-[#5F6F5A]"
                          aria-label="Produto em destaque"
                        />
                      </label>
                    </div>
                  </div>
                </fieldset>

                <div className="flex flex-wrap gap-3 pt-1">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    aria-label={isEditMode ? 'Salvar alteracoes do produto' : 'Criar novo produto'}
                    className={buttonFocusClassName}
                  >
                    <PlusCircle size={16} aria-hidden="true" />
                    {isSubmitting ? 'Salvando...' : isEditMode ? 'Salvar alteracoes' : 'Criar produto'}
                  </Button>
                  {isEditMode && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      aria-label="Cancelar alteracoes"
                      className={buttonFocusClassName}
                    >
                      <XCircle size={16} aria-hidden="true" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </section>

            <aside className={`self-start lg:sticky lg:top-24 ${cardClassName}`}>
              <h3 className="font-display text-2xl text-[#2B2B2B]">Preview do Produto</h3>
              <p className="mt-1 text-sm text-slate-600">Visual aproximado do card no catalogo publico.</p>

              <article className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className={`relative aspect-[4/3] overflow-hidden ${!isAvailable ? 'opacity-70' : ''}`}>
                  <ProductImage
                    src={previewImage}
                    alt="Preview do produto"
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <Badge variant="category">{previewCategoryName}</Badge>
                    {isFeatured && <Badge variant="featured">Destaque</Badge>}
                    {!isAvailable && <Badge variant="unavailable">Indisponivel</Badge>}
                  </div>
                </div>

                <div className="space-y-2 p-4">
                  <h4 className="line-clamp-1 font-display text-xl text-[#2B2B2B]">{name.trim() || 'Nome do produto'}</h4>
                  <p className="line-clamp-2 text-sm text-slate-600">{previewDescription}</p>
                  <p className="font-mono text-lg font-semibold text-[#5F6F5A]">{previewPrice}</p>
                  <p className="text-xs text-slate-500">Pedido minimo: {minQuantity || '1'} un</p>

                  {previewTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {previewTags.slice(0, 4).map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </aside>
          </section>
        )}

        {activeTab === 'categories' && (
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <section className={`${cardClassName}`}>
              <h2 className="font-display text-3xl text-[#2B2B2B]">Nova categoria</h2>
              <p className="mt-1 text-sm text-slate-600">
                Informe o nome da categoria. O slug sera gerado automaticamente.
              </p>

              <form className="mt-5 space-y-4" onSubmit={handleCreateCategory}>
                <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="category-name">
                  Nome da categoria
                  <input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(event) =>
                      setCategoryForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required
                    aria-label="Nome da categoria"
                    placeholder="Ex.: Canecas premium"
                    className={fieldClassName}
                  />
                </label>

                <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                  Categoria em destaque
                  <input
                    type="checkbox"
                    checked={categoryForm.isFeatured}
                    onChange={(event) =>
                      setCategoryForm((current) => ({
                        ...current,
                        isFeatured: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-[#5F6F5A] transition-all duration-200 focus:ring-[#5F6F5A]"
                    aria-label="Categoria em destaque"
                  />
                </label>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Slug gerado</p>
                  <p className="mt-1 font-mono text-sm font-medium text-[#2B2B2B]">/{categorySlugPreview}</p>
                </div>

                <Button
                  type="submit"
                  disabled={isSavingCategory}
                  className={buttonFocusClassName}
                  aria-label="Salvar categoria"
                >
                  <PlusCircle size={16} aria-hidden="true" />
                  {isSavingCategory ? 'Salvando categoria...' : 'Salvar Categoria'}
                </Button>
              </form>
            </section>

            <section className={`${cardClassName}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-3xl text-[#2B2B2B]">Categorias cadastradas</h2>
                  <p className="mt-1 text-sm text-slate-600">Gerencie as categorias usadas pelos produtos.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void reloadCategories()}
                  aria-label="Atualizar lista de categorias"
                  className={buttonFocusClassName}
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  Atualizar lista
                </Button>
              </div>

              {categoriesError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Falha ao carregar categorias: {categoriesError}
                </div>
              )}

              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 bg-white">
                  <thead className="bg-slate-100/70">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Nome</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Slug</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Destaque</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingCategories && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                          Carregando categorias...
                        </td>
                      </tr>
                    )}

                    {!isLoadingCategories && categories.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                          Nenhuma categoria cadastrada.
                        </td>
                      </tr>
                    )}

                    {!isLoadingCategories &&
                      categories.map((category) => {
                        const linkedProducts = categoryUsageCountById.get(category.id) ?? 0

                        return (
                          <tr key={category.id} className="hover:bg-slate-50/80">
                            <td className="px-4 py-3">
                              <p className="font-medium text-[#2B2B2B]">{category.name}</p>
                              <p className="text-xs text-slate-500">{linkedProducts} produtos vinculados</p>
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-slate-600">/{category.slug}</td>
                            <td className="px-4 py-3">
                              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={Boolean(category.is_featured)}
                                  disabled={isUpdatingCategoryFeaturedId === category.id}
                                  onChange={(event) =>
                                    void handleToggleCategoryFeatured(category.id, event.target.checked)
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-[#5F6F5A] transition-all duration-200 focus:ring-[#5F6F5A]"
                                  aria-label={`Categoria ${category.name} em destaque`}
                                />
                                {category.is_featured ? 'Em destaque' : 'Normal'}
                              </label>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteCategoryModal(category.id, category.name)}
                                disabled={isDeletingCategoryId === category.id}
                                aria-label={`Excluir categoria ${category.name}`}
                                className={`border-[#5F6F5A]/40 text-[#5F6F5A] hover:border-[#5F6F5A] hover:text-[#5F6F5A] ${buttonFocusClassName}`}
                              >
                                <Trash2 size={14} aria-hidden="true" />
                                {isDeletingCategoryId === category.id ? 'Excluindo...' : 'Excluir'}
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className={`${cardClassName}`}>
              <div>
                <h2 className="font-display text-3xl text-[#2B2B2B]">Contatos e redes do site</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Esses dados aparecem na pagina principal para os clientes entrarem em contato.
                </p>
              </div>

              {siteSettingsError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Falha ao carregar configuracoes: {siteSettingsError}
                </div>
              )}

              <form className="mt-5 space-y-4" onSubmit={handleSaveSiteSettings}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="settings-whatsapp">
                    <span className="inline-flex items-center gap-1">
                      <Phone size={14} aria-hidden="true" /> WhatsApp
                    </span>
                    <input
                      id="settings-whatsapp"
                      value={siteSettingsForm.whatsappNumber}
                      onChange={(event) => handleSiteSettingsChange('whatsappNumber', event.target.value)}
                      placeholder="Ex.: 85999999999"
                      className={fieldClassName}
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="settings-phone">
                    <span className="inline-flex items-center gap-1">
                      <Phone size={14} aria-hidden="true" /> Telefone exibicao
                    </span>
                    <input
                      id="settings-phone"
                      value={siteSettingsForm.contactPhone}
                      onChange={(event) => handleSiteSettingsChange('contactPhone', event.target.value)}
                      placeholder="Ex.: (85) 99999-9999"
                      className={fieldClassName}
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="settings-email">
                    <span className="inline-flex items-center gap-1">
                      <Mail size={14} aria-hidden="true" /> Email de contato
                    </span>
                    <input
                      id="settings-email"
                      type="email"
                      value={siteSettingsForm.contactEmail}
                      onChange={(event) => handleSiteSettingsChange('contactEmail', event.target.value)}
                      placeholder="contato@bianto.com"
                      className={fieldClassName}
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="settings-website">
                    <span className="inline-flex items-center gap-1">
                      <Globe size={14} aria-hidden="true" /> Site
                    </span>
                    <input
                      id="settings-website"
                      value={siteSettingsForm.websiteUrl}
                      onChange={(event) => handleSiteSettingsChange('websiteUrl', event.target.value)}
                      placeholder="https://bianto.com"
                      className={fieldClassName}
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="settings-instagram">
                    <span className="inline-flex items-center gap-1">
                      <LinkIcon size={14} aria-hidden="true" /> Instagram
                    </span>
                    <input
                      id="settings-instagram"
                      value={siteSettingsForm.instagramUrl}
                      onChange={(event) => handleSiteSettingsChange('instagramUrl', event.target.value)}
                      placeholder="https://instagram.com/..."
                      className={fieldClassName}
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="settings-facebook">
                    <span className="inline-flex items-center gap-1">
                      <LinkIcon size={14} aria-hidden="true" /> Facebook
                    </span>
                    <input
                      id="settings-facebook"
                      value={siteSettingsForm.facebookUrl}
                      onChange={(event) => handleSiteSettingsChange('facebookUrl', event.target.value)}
                      placeholder="https://facebook.com/..."
                      className={fieldClassName}
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="settings-linkedin">
                    <span className="inline-flex items-center gap-1">
                      <LinkIcon size={14} aria-hidden="true" /> LinkedIn
                    </span>
                    <input
                      id="settings-linkedin"
                      value={siteSettingsForm.linkedinUrl}
                      onChange={(event) => handleSiteSettingsChange('linkedinUrl', event.target.value)}
                      placeholder="https://linkedin.com/company/..."
                      className={fieldClassName}
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="settings-youtube">
                    <span className="inline-flex items-center gap-1">
                      <LinkIcon size={14} aria-hidden="true" /> YouTube
                    </span>
                    <input
                      id="settings-youtube"
                      value={siteSettingsForm.youtubeUrl}
                      onChange={(event) => handleSiteSettingsChange('youtubeUrl', event.target.value)}
                      placeholder="https://youtube.com/..."
                      className={fieldClassName}
                    />
                  </label>
                </div>

                <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="settings-support-link">
                  <span className="inline-flex items-center gap-1">
                    <LinkIcon size={14} aria-hidden="true" /> Link alternativo de atendimento
                  </span>
                  <input
                    id="settings-support-link"
                    value={siteSettingsForm.supportLink}
                    onChange={(event) => handleSiteSettingsChange('supportLink', event.target.value)}
                    placeholder="https://linktr.ee/..."
                    className={fieldClassName}
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    disabled={isSavingSiteSettings || isLoadingSiteSettings}
                    className={buttonFocusClassName}
                    aria-label="Salvar configuracoes do site"
                  >
                    {isSavingSiteSettings ? 'Salvando...' : 'Salvar configuracoes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void reloadSiteSettings()}
                    disabled={isSavingSiteSettings || isLoadingSiteSettings}
                    className={buttonFocusClassName}
                    aria-label="Recarregar configuracoes do site"
                  >
                    <RefreshCw size={14} aria-hidden="true" />
                    Recarregar
                  </Button>
                </div>
              </form>
            </section>

            <aside className={`${cardClassName} self-start`}>
              <h3 className="font-display text-2xl text-[#2B2B2B]">Preview dos contatos</h3>
              <p className="mt-1 text-sm text-slate-600">Assim os dados aparecem para o cliente na pagina inicial.</p>

              <div className="mt-4 space-y-2 text-sm">
                <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700">
                  WhatsApp: {siteSettingsForm.whatsappNumber || 'Nao informado'}
                </p>
                <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700">
                  Telefone: {siteSettingsForm.contactPhone || 'Nao informado'}
                </p>
                <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700">
                  Email: {siteSettingsForm.contactEmail || 'Nao informado'}
                </p>
                <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700">
                  Instagram: {siteSettingsForm.instagramUrl || 'Nao informado'}
                </p>
                <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700">
                  Link alternativo: {siteSettingsForm.supportLink || 'Nao informado'}
                </p>
              </div>
            </aside>
          </section>
        )}

        {isDeleteDialogOpen && (
          <>
            <div
              className="fixed inset-0 z-[70] bg-[#2B2B2B]/55 backdrop-blur-[2px]"
              onClick={handleCloseDeleteDialog}
              aria-hidden="true"
            />

            <section
              className="fixed left-1/2 top-1/2 z-[80] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-label="Confirmacao de exclusao"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5F6F5A]/10 text-[#5F6F5A]">
                  <AlertTriangle size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-2xl text-[#2B2B2B]">
                    {deleteProductTarget ? 'Excluir produto' : 'Excluir categoria'}
                  </h3>

                  {deleteProductTarget && (
                    <p className="mt-2 text-sm text-slate-600">
                      Deseja realmente remover o produto <strong>{deleteProductTarget.name}</strong>? Essa acao nao pode ser desfeita.
                    </p>
                  )}

                  {deleteCategoryTarget && (
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <p>
                        Deseja realmente remover a categoria <strong>{deleteCategoryTarget.name}</strong>?
                      </p>
                      {deleteCategoryTarget.linkedProducts > 0 ? (
                        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                          Esta categoria sera removida de {deleteCategoryTarget.linkedProducts} produto(s). Os produtos serao movidos automaticamente para uma categoria de fallback para concluir a exclusao.
                        </p>
                      ) : (
                        <p>Essa categoria nao possui produtos vinculados.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDeleteDialog}
                  disabled={isDeleteDialogBusy}
                  className={buttonFocusClassName}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmDeleteDialog}
                  disabled={isDeleteDialogBusy}
                  className={`bg-[#5F6F5A] text-white hover:bg-[#7A8F73] ${buttonFocusClassName}`}
                >
                  {isDeleteDialogBusy
                    ? 'Processando...'
                    : deleteProductTarget
                      ? 'Excluir produto'
                      : 'Excluir categoria'}
                </Button>
              </div>
            </section>
          </>
        )}
      </div>
      {isBulkEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-navy">Editar ({selectedProductIds.size}) Produtos em Massa</h2>
              <p className="mt-1 text-sm text-slate-500">
                Os campos que voce deixar como "Sem mudanca" nao alterarao os valores originais dos produtos.
              </p>
            </div>

            <form onSubmit={handleBulkEditSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Disponibilidade</span>
                <select
                  value={bulkEditIsAvailable}
                  onChange={(e) => setBulkEditIsAvailable(e.target.value as any)}
                  className={fieldClassName}
                >
                  <option value="unchanged">Manter valor atual</option>
                  <option value="true">Disponivel</option>
                  <option value="false">Indisponivel</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Destaque</span>
                <select
                  value={bulkEditIsFeatured}
                  onChange={(e) => setBulkEditIsFeatured(e.target.value as any)}
                  className={fieldClassName}
                >
                  <option value="unchanged">Manter valor atual</option>
                  <option value="true">Sim (Destacar)</option>
                  <option value="false">Nao</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Categoria Principal</span>
                <select
                  value={bulkEditCategoryId}
                  onChange={(e) => setBulkEditCategoryId(e.target.value)}
                  className={fieldClassName}
                >
                  <option value="">Manter valor atual</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>

              <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBulkEditModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Aplicar alteracoes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
