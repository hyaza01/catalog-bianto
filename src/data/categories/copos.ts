import type { Product } from '../../types/product'
import { DEMO_IMAGE_URL } from './shared'

export const copos: Product[] = [
  {
    id: '4b4af2f2-ff95-4f79-b1f2-77d8309014fa',
    name: 'Copo Frost 550ml',
    description: {
      short: 'Copo transluscido com tampa e canudo.',
      long: 'Produto de alta saida para campanhas promocionais. Permite personalizacao em tampografia e opcao de embalagem individual.',
    },
    category: 'copos',
    price: 32.9,
    minQuantity: 20,
    images: [DEMO_IMAGE_URL],
    tags: ['festa', 'promocional', 'canudo', 'tampografia'],
    flags: {
      isAvailable: true,
      isFeatured: true,
      isCustomizable: true,
    },
    variants: {
      sizes: ['550ml'],
      colors: ['Transparente', 'Fume', 'Lilac'],
    },
  },
  {
    id: '9515b809-5fd7-4303-b95f-a9f2c72e1983',
    name: 'Copo Slim 350ml',
    description: {
      short: 'Formato alto com pegada ergonomica.',
      long: 'Copo ideal para lembrancas de aniversario e eventos sociais. Possui acabamento brilhante e area ampla para personalizacao frontal.',
    },
    category: 'copos',
    price: 29.9,
    minQuantity: 30,
    images: [DEMO_IMAGE_URL],
    tags: ['evento', 'festa', 'lembranca', 'economico'],
    flags: {
      isAvailable: true,
      isFeatured: false,
      isCustomizable: true,
    },
    variants: {
      sizes: ['350ml'],
      colors: ['Branco', 'Vermelho', 'Azul'],
    },
  },
]
