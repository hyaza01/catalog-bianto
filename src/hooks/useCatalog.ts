import { useEffect, useState } from 'react'
import { catalog } from '../data'
import type { Product } from '../types/product'

interface UseCatalogResult {
  products: Product[]
  isLoading: boolean
}

export const useCatalog = (): UseCatalogResult => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProducts(catalog)
      setIsLoading(false)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [])

  return {
    products,
    isLoading,
  }
}
