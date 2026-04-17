export const CATEGORY_VALUES = ['canecas', 'garrafas-termicas', 'copos', 'kits-especiais', 'outros'] as const

export type Category = (typeof CATEGORY_VALUES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  canecas: 'Canecas',
  'garrafas-termicas': 'Garrafas termicas',
  copos: 'Copos',
  'kits-especiais': 'Kits especiais',
  outros: 'Outros',
}

export interface ProductDescription {
  short: string
  long: string
}

export interface ProductFlags {
  isAvailable: boolean
  isFeatured: boolean
  isCustomizable: boolean
}

export interface ProductVariants {
  sizes?: string[]
  colors?: string[]
}

export interface Product {
  id: string
  name: string
  description: ProductDescription
  category: Category
  categoryId?: string
  categoryIds?: string[]
  categoryName?: string
  price: number
  minQuantity: number
  images: string[]
  tags: string[]
  flags: ProductFlags
  variants?: ProductVariants
  ratingAvg?: number
  reviewsCount?: number
  productionTime?: string | null
}

export interface PriceRange {
  min: number
  max: number
}

export type CategoryFilter = 'all' | string

export type CatalogSort = 'relevance' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'

export interface CatalogFiltersState {
  search: string
  category: CategoryFilter
  priceRange: PriceRange
  selectedTags: string[]
  onlyAvailable: boolean
  sort: CatalogSort
}
