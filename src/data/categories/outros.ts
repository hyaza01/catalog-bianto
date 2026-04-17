import type { Product } from '../../types/product'
import { DEMO_IMAGE_URL } from './shared'

export const outros: Product[] = [
  {
    id: '1f6fba45-8bd9-4cbb-87b5-b4ed26dc4935',
    name: 'Ecobag Personalizada',
    description: {
      short: 'Bolsa de algodao cru para eventos e brindes.',
      long: 'Opcao sustentavel para complementar kits e acao de marca. Possui alta area de impressao e diferentes opcoes de alca.',
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
