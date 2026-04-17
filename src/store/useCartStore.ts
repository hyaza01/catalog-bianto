import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CartItem, Product } from '../@types'

interface CartStoreState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, observation?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateObservation: (productId: string, observation: string) => void
  clearCart: () => void
}

const normalizeQuantity = (value: number | undefined, minimum: number): number => {
  const raw = Number(value)

  if (!Number.isFinite(raw)) {
    return minimum
  }

  return Math.max(minimum, Math.round(raw))
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity, observation = '') => {
        set((state) => {
          const nextQuantity = normalizeQuantity(quantity, product.min_quantity)
          const existingItem = state.items.find((item) => item.product.id === product.id)

          if (!existingItem) {
            return {
              items: [
                ...state.items,
                {
                  product,
                  quantity: nextQuantity,
                  observation,
                },
              ],
            }
          }

          return {
            items: state.items.map((item) => {
              if (item.product.id !== product.id) {
                return item
              }

              return {
                ...item,
                quantity: normalizeQuantity(item.quantity + nextQuantity, product.min_quantity),
                observation: observation || item.observation,
              }
            }),
          }
        })
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id !== productId) {
              return item
            }

            return {
              ...item,
              quantity: normalizeQuantity(quantity, item.product.min_quantity),
            }
          }),
        }))
      },
      updateObservation: (productId, observation) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? {
                  ...item,
                  observation,
                }
              : item,
          ),
        }))
      },
      clearCart: () => {
        set({ items: [] })
      },
    }),
    {
      name: 'bianto-store-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      version: 1,
    },
  ),
)
