import { useMemo } from 'react'
import type { Product } from '../types/product'
import { useSelectionStore } from '../store/selectionStore'
import type { SelectionItemDetailed } from '../types/selection'

export const useSelection = (products: Product[] = []) => {
  const items = useSelectionStore((state) => state.items)

  const productsById = useMemo(() => {
    const map = new Map<string, Product>()
    products.forEach((product) => {
      map.set(product.id, product)
    })
    return map
  }, [products])

  const detailedItems = useMemo<SelectionItemDetailed[]>(
    () =>
      items
        .map((item) => {
          const product = productsById.get(item.productId)

          if (!product) {
            return null
          }

          return {
            ...item,
            product,
          }
        })
        .filter((item): item is SelectionItemDetailed => item !== null),
    [items, productsById],
  )

  const uniqueItemsCount = items.length

  const totalQuantity = items.reduce((accumulator, item) => accumulator + item.quantity, 0)

  return {
    items,
    detailedItems,
    uniqueItemsCount,
    totalQuantity,
  }
}
