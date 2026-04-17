import type { Product } from '../../types/product'
import { DEMO_IMAGE_URL } from './shared'

export const kitsEspeciais: Product[] = [
  {
    id: 'd74c2f8b-17f7-4a7f-8ef0-e40f02d6de0f',
    name: 'Kit Celebre',
    description: {
      short: 'Kit com caneca, copo e cartao premium.',
      long: 'Composicao pronta para presentear clientes e colaboradores. Pode incluir arte exclusiva em todos os itens e mensagem impressa.',
    },
    category: 'kits-especiais',
    price: 159.9,
    minQuantity: 4,
    images: [DEMO_IMAGE_URL],
    tags: ['kit', 'presente', 'premium', 'datas-especiais'],
    flags: {
      isAvailable: true,
      isFeatured: true,
      isCustomizable: true,
    },
  },
  {
    id: '56a894fc-fdd0-46d3-8e7b-a7ccf664ec4d',
    name: 'Kit Corporativo Signature',
    description: {
      short: 'Kit com garrafa termica, caneca e embalagem rigida.',
      long: 'Soluicao premium para onboarding e reconhecimento de equipe. Inclui embalagem elegante, manual personalizado e acabamento refinado.',
    },
    category: 'kits-especiais',
    price: 199,
    minQuantity: 3,
    images: [DEMO_IMAGE_URL],
    tags: ['kit', 'corporativo', 'onboarding', 'executivo'],
    flags: {
      isAvailable: true,
      isFeatured: true,
      isCustomizable: true,
    },
  },
]
