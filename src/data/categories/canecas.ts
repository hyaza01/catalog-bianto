import type { Product } from '../../types/product'
import { DEMO_IMAGE_URL } from './shared'

export const canecas: Product[] = [
  {
    id: '29b74cb1-8012-4f4f-87f0-364f6f9b6ad1',
    name: 'Caneca Aurora 350ml',
    description: {
      short: 'Caneca em ceramica premium com acabamento fosco.',
      long: 'Caneca pensada para brindes elegantes, com area ampla para logo e frase. Ideal para eventos corporativos e kits comemorativos.',
    },
    category: 'canecas',
    price: 39.9,
    minQuantity: 10,
    images: [DEMO_IMAGE_URL],
    tags: ['ceramica', 'premium', 'brinde', 'logo'],
    flags: {
      isAvailable: true,
      isFeatured: true,
      isCustomizable: true,
    },
    variants: {
      sizes: ['350ml'],
      colors: ['Branco', 'Off-white', 'Vermelho'],
    },
  },
  {
    id: '124558e0-ef82-4b8a-a3dd-c5c042dafea8',
    name: 'Caneca Signature 400ml',
    description: {
      short: 'Modelo robusto com alca reforcada e arte em silk.',
      long: 'Caneca para campanhas de marca com visual sofisticado. Recebe personalizacao frente e verso em silk UV de alta definicao.',
    },
    category: 'canecas',
    price: 49.9,
    minQuantity: 6,
    images: [DEMO_IMAGE_URL],
    tags: ['ceramica', 'silk', 'evento', 'presente'],
    flags: {
      isAvailable: true,
      isFeatured: false,
      isCustomizable: true,
    },
    variants: {
      sizes: ['400ml'],
      colors: ['Branco', 'Preto'],
    },
  },
]
