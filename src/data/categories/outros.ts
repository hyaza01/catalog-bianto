import type { Product } from '../../types/product'
import { DEMO_IMAGE_URL } from './shared'

export const outros: Product[] = [
  {
    id: '1f6fba45-8bd9-4cbb-87b5-b4ed26dc4935',
    name: 'Ecobag Personalizada',
    description: {
      short: 'Bolsa de algodão cru para eventos e brindes.',
      long: 'Opção sustentável para complementar kits e ação de marca. Possui alta área de impressão e diferentes opções de alça.',
    },
    category: 'outros',
    price: 24.9,
    minQuantity: 25,
    images: [DEMO_IMAGE_URL],
    tags: ['sustentavel', 'evento', 'algodao', 'brinde'],
    flags: {
      isAvailable: true,
      isFeatured: false,
      isCustomizable: true,
    },
    variants: {
      sizes: ['P', 'M', 'G'],
      colors: ['Cru', 'Preto'],
    },
  },
]
