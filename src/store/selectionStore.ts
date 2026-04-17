import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SelectionItem } from '../types/selection'

interface SelectionStore {
  items: SelectionItem[]
  addItem: (productId: string, quantity: number, note?: string, minimumQuantity?: number) => void
  updateQuantity: (productId: string, quantity: number, minimumQuantity?: number) => void
  updateNote: (productId: string, note: string) => void
  removeItem: (productId: string) => void
  clearSelection: () => void
}

const normalizeQuantity = (quantity: number, minimumQuantity = 1): number => {
  const minimum = Math.max(1, Math.round(minimumQuantity))

  if (Number.isNaN(quantity) || quantity < minimum) {
    return minimum
  }

  return Math.round(quantity)
}

export const useSelectionStore = create<SelectionStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (productId, quantity, note = '', minimumQuantity = 1) => {
        set((state) => {
          const normalizedQuantity = normalizeQuantity(quantity, minimumQuantity)
          const existingItem = state.items.find((item) => item.productId === productId)

          if (!existingItem) {
            return {
              items: [
                ...state.items,
                {
                  productId,
                  quantity: normalizedQuantity,
                  note,
                },
              ],
            }
          }

          return {
            items: state.items.map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: normalizeQuantity(item.quantity + normalizedQuantity, minimumQuantity),
                    note: note || item.note,
                  }
                : item,
            ),
          }
        })
      },
      updateQuantity: (productId, quantity, minimumQuantity = 1) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: normalizeQuantity(quantity, minimumQuantity),
                }
              : item,
          ),
        }))
      },
      updateNote: (productId, note) => {
        set((state) => ({
          items: state.items.map((item) => (item.productId === productId ? { ...item, note } : item)),
        }))
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }))
      },
      clearSelection: () => {
        set({ items: [] })
      },
    }),
    {
      name: 'bianto-store-selection',
    },
  ),
)
