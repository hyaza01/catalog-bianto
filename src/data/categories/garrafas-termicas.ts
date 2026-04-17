import type { Product } from '../../types/product'
import { DEMO_IMAGE_URL } from './shared'

export const garrafasTermicas: Product[] = [
  {
    id: '2a93b69e-9278-4304-aa9d-15a6cac4d10b',
    name: 'Garrafa Termica Premium 500ml',
    description: {
      short: 'Parede dupla para manter temperatura por horas.',
      long: 'Perfeita para kits executivos. Mantem bebidas quentes ou geladas por longos periodos e permite gravacao a laser com alta durabilidade.',
    },
    category: 'garrafas-termicas',
    price: 89.9,
    minQuantity: 5,
    images: [DEMO_IMAGE_URL],
    tags: ['inox', 'termica', 'corporativo', 'laser'],
    flags: {
      isAvailable: true,
      isFeatured: true,
      isCustomizable: true,
    },
    variants: {
      sizes: ['500ml', '750ml'],
      colors: ['Preto', 'Champagne', 'Grafite'],
    },
  },
  {
    id: 'a3901d99-b136-44d6-8b16-7f6890055329',
    name: 'Garrafa Travel Slim 450ml',
    description: {
      short: 'Leve e compacta para uso diario.',
      long: 'Modelo slim para academias e rotinas externas. Possui tampa anti-vazamento e area frontal para aplicacao de nome ou marca.',
    },
    category: 'garrafas-termicas',
    price: 74.5,
    minQuantity: 8,
    images: [DEMO_IMAGE_URL],
    tags: ['termica', 'slim', 'academia', 'nome'],
    flags: {
      isAvailable: false,
      isFeatured: false,
      isCustomizable: true,
    },
    variants: {
      sizes: ['450ml'],
      colors: ['Branco', 'Azul-marinho', 'Rosa'],
    },
  },
]
