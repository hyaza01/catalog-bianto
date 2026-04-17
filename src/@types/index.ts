export type Category = 'canecas' | 'garrafas-termicas' | 'copos' | 'kits-especiais' | 'outros'

export interface ProductOptions {
  colors?: string[]
  sizes?: string[]
}

export interface ProductMetadata {
  is_featured: boolean
  is_available: boolean
  category_ids?: string[]
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category_id: string
  images: string[]
  min_quantity: number
  options: ProductOptions | null
  metadata: ProductMetadata
  tags: string[]
}

export interface CategoryEntity {
  id: string
  slug: string
  name: string
  description?: string | null
  is_featured?: boolean
  created_at?: string
  updated_at?: string
}

export interface CartItem {
  product: Product
  quantity: number
  observation: string
}
