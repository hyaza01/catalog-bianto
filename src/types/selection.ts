import type { Product } from './product'

export interface SelectionItem {
  productId: string
  quantity: number
  note: string
}

export interface SelectionItemDetailed extends SelectionItem {
  product: Product
}
