import { CATEGORY_VALUES, type Category, type Product } from '../types/product'
import { canecas } from './categories/canecas'
import { copos } from './categories/copos'
import { garrafasTermicas } from './categories/garrafas-termicas'
import { kitsEspeciais } from './categories/kits'
import { outros } from './categories/outros'
import { DEMO_IMAGE_URL } from './categories/shared'

export const CATEGORY_LABELS: Record<Category, string> = {
  canecas: 'Canecas',
  'garrafas-termicas': 'Garrafas termicas',
  copos: 'Copos',
  'kits-especiais': 'Kits especiais',
  outros: 'Outros',
}

export const MAIN_CATEGORIES: Category[] = ['canecas', 'garrafas-termicas', 'copos', 'kits-especiais']

export const catalog: Product[] = [...canecas, ...garrafasTermicas, ...copos, ...kitsEspeciais, ...outros]

export const PRODUCTS = catalog

export const PRODUCTS_BY_ID = PRODUCTS.reduce<Record<string, Product>>((accumulator, product) => {
  accumulator[product.id] = product
  return accumulator
}, {})

export const ALL_TAGS = Array.from(new Set(PRODUCTS.flatMap((product) => product.tags))).sort((a, b) =>
  a.localeCompare(b),
)

const priceValues = PRODUCTS.map((product) => product.price)

export const PRICE_RANGE = {
  min: Math.min(...priceValues),
  max: Math.max(...priceValues),
}

export const FEATURED_PRODUCTS = PRODUCTS.filter((product) => product.flags.isFeatured)

export { CATEGORY_VALUES }
export { DEMO_IMAGE_URL as DEFAULT_PRODUCT_IMAGE_URL }
