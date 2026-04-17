import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { usePublicCategories } from '../hooks/usePublicCategories'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { useSelectionStore } from '../store/selectionStore'
import { type Product } from '../types/product'
import { formatBrazilPhoneDisplay, normalizePhoneDigits, resolveBrazilWhatsAppNumber } from '../utils/phone'
import { buildDirectWhatsAppMessage, createDirectWhatsAppLink } from '../utils/whatsapp'
import { Button } from '../components/ui/Button'
import { ProductCard } from '../components/catalog/ProductCard'
import { ProductDetailModal } from '../components/catalog/ProductDetailModal'
import { ContactLogo, type ContactKind } from '../components/common/ContactLogo'
import { FloatingOrbs } from '../components/common/FloatingOrbs'
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants'

const fadeUpVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const staggerContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const staggerItemVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const heroTextVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const heroItemVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const categoryDescriptions: Record<string, string> = {
  canecas: 'Modelos clássicos e premium para presentear.',
  'garrafas-termicas': 'Térmicas duráveis para rotina e eventos.',
  copos: 'Copos modernos para brindes e festas.',
  'kits-especiais': 'Combinações prontas para encantar clientes.',
  outros: 'Outros itens personalizados sob consulta.',
}

const normalizeExternalUrl = (rawUrl: string): string | null => {
  const trimmed = rawUrl.trim()
  if (!trimmed) {
    return null
  }

  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}

type ContactLink = {
  id: string
  title: string
  value: string
  href: string
  kind: ContactKind
}

const buildCatalogLink = (params: {
  categoryId?: string
  productName?: string
  tags?: string[]
  onlyAvailable?: boolean
}): string => {
  const search = new URLSearchParams()

  const categoryId = params.categoryId?.trim() ?? ''
  if (categoryId) {
    search.set('categoria', categoryId)
  }

  const productName = params.productName?.trim() ?? ''
  if (productName) {
    search.set('busca', productName)
  }

  const validTags = (params.tags ?? []).map((tag) => tag.trim()).filter((tag) => tag.length > 0)
  if (validTags.length > 0) {
    search.set('tags', validTags.join(','))
  }

  if (params.onlyAvailable) {
    search.set('disponiveis', '1')
  }

  const queryString = search.toString()
  return queryString ? `/catalogo?${queryString}` : '/catalogo'
}

export const HomePage = () => {
  const navigate = useNavigate()
  const categoriesCarouselRef = useRef<HTMLDivElement>(null)
  const productsCarouselRef = useRef<HTMLDivElement>(null)

  const scrollCategoriesCarousel = (direction: 'left' | 'right') => {
    if (categoriesCarouselRef.current) {
      const scrollAmount = 272 * 2
      categoriesCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const scrollProductsCarousel = (direction: 'left' | 'right') => {
    if (productsCarouselRef.current) {
      const scrollAmount = 272 * 2
      productsCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const { data: products, isLoading, error: productsError } = useProducts()
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = usePublicCategories()
  const { settings: siteSettings } = useSiteSettings()
  const addItem = useSelectionStore((state) => state.addItem)
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null)

  const heroBackground = products[0]?.images[0] ?? DEFAULT_PRODUCT_IMAGE

  const featuredProducts = useMemo(
    () => products.filter((product) => product.flags.isFeatured),
    [products],
  )

  const primaryCategories = useMemo(() => {
    return categories
      .filter((category) => category.isFeatured)
      .slice(0, 8)
  }, [categories])

  const categoryPreviewImageById = useMemo(() => {
    return primaryCategories.reduce<Record<string, string>>((accumulator, category) => {
      const matchingProduct = products.find(
        (product) =>
          (product.categoryId && product.categoryId === category.id) ||
          product.category === category.slug,
      )

      accumulator[category.id] = matchingProduct?.images[0] || DEFAULT_PRODUCT_IMAGE
      return accumulator
    }, {})
  }, [primaryCategories, products])

  const contactLinks = useMemo(() => {
    const links: ContactLink[] = []

    const whatsappNumber = resolveBrazilWhatsAppNumber([
      siteSettings.whatsappNumber,
      siteSettings.contactPhone,
      import.meta.env.VITE_WHATSAPP_NUMBER,
    ])

    if (whatsappNumber) {
      links.push({
        id: 'whatsapp',
        title: 'WhatsApp',
        value: formatBrazilPhoneDisplay(whatsappNumber),
        href:
          createDirectWhatsAppLink(
            whatsappNumber,
            buildDirectWhatsAppMessage(),
          ) || `https://wa.me/${whatsappNumber}`,
        kind: 'whatsapp',
      })
    }

    const contactPhoneDigits = normalizePhoneDigits(siteSettings.contactPhone)
    if (contactPhoneDigits) {
      links.push({
        id: 'phone',
        title: 'Telefone',
        value: formatBrazilPhoneDisplay(siteSettings.contactPhone),
        href: `tel:+${resolveBrazilWhatsAppNumber([siteSettings.contactPhone]) || contactPhoneDigits}`,
        kind: 'phone',
      })
    }

    const contactEmail = siteSettings.contactEmail.trim()
    if (contactEmail) {
      links.push({
        id: 'email',
        title: 'E-mail',
        value: contactEmail,
        href: `mailto:${contactEmail}`,
        kind: 'email',
      })
    }

    const siteUrl = normalizeExternalUrl(siteSettings.websiteUrl)
    if (siteUrl) {
      links.push({
        id: 'website',
        title: 'Site',
        value: siteSettings.websiteUrl.trim(),
        href: siteUrl,
        kind: 'website',
      })
    }

    const instagramUrl = normalizeExternalUrl(siteSettings.instagramUrl)
    if (instagramUrl) {
      links.push({
        id: 'instagram',
        title: 'Instagram',
        value: siteSettings.instagramUrl.trim(),
        href: instagramUrl,
        kind: 'instagram',
      })
    }

    const facebookUrl = normalizeExternalUrl(siteSettings.facebookUrl)
    if (facebookUrl) {
      links.push({
        id: 'facebook',
        title: 'Facebook',
        value: siteSettings.facebookUrl.trim(),
        href: facebookUrl,
        kind: 'facebook',
      })
    }

    const linkedinUrl = normalizeExternalUrl(siteSettings.linkedinUrl)
    if (linkedinUrl) {
      links.push({
        id: 'linkedin',
        title: 'LinkedIn',
        value: siteSettings.linkedinUrl.trim(),
        href: linkedinUrl,
        kind: 'linkedin',
      })
    }

    const youtubeUrl = normalizeExternalUrl(siteSettings.youtubeUrl)
    if (youtubeUrl) {
      links.push({
        id: 'youtube',
        title: 'YouTube',
        value: siteSettings.youtubeUrl.trim(),
        href: youtubeUrl,
        kind: 'youtube',
      })
    }

    const supportLink = normalizeExternalUrl(siteSettings.supportLink)
    if (supportLink) {
      links.push({
        id: 'support',
        title: 'Atendimento',
        value: siteSettings.supportLink.trim(),
        href: supportLink,
        kind: 'support',
      })
    }

    return links
  }, [siteSettings])

  const whatsappLink = useMemo(() => {
    const phone = resolveBrazilWhatsAppNumber([
      siteSettings.whatsappNumber,
      siteSettings.contactPhone,
      import.meta.env.VITE_WHATSAPP_NUMBER,
    ])

    if (!phone) {
      return null
    }

    return createDirectWhatsAppLink(phone, buildDirectWhatsAppMessage())
  }, [siteSettings.contactPhone, siteSettings.whatsappNumber])

  const fallbackContactLink = useMemo(() => {
    const candidates = [
      siteSettings.supportLink,
      siteSettings.instagramUrl,
      siteSettings.facebookUrl,
      siteSettings.websiteUrl,
    ]

    for (const candidate of candidates) {
      const normalized = normalizeExternalUrl(candidate)
      if (normalized) {
        return normalized
      }
    }

    return null
  }, [siteSettings.facebookUrl, siteSettings.instagramUrl, siteSettings.supportLink, siteSettings.websiteUrl])

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden border-b border-brand-text/10"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(43, 43, 43, 0.92), rgba(95, 111, 90, 0.85), rgba(122, 143, 115, 0.75)), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <FloatingOrbs />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-28">
          <motion.div
            className="space-y-6"
            variants={heroTextVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p variants={heroItemVariants} className="inline-flex rounded-full border border-paper/20 bg-paper/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-paper/90 backdrop-blur-sm">
              {siteSettings.content.heroBadge}
            </motion.p>
            <motion.h1 variants={heroItemVariants} className="font-display text-4xl leading-[1.1] text-paper sm:text-5xl lg:text-6xl">
              {siteSettings.content.heroTitle}
              <span className="mt-1 block text-brand-accent italic">{siteSettings.content.heroSubtitle}</span>
            </motion.h1>
            <motion.p variants={heroItemVariants} className="max-w-xl text-base leading-relaxed text-paper/80 sm:text-lg">
              {siteSettings.content.heroDescription}
            </motion.p>
            <motion.div variants={heroItemVariants} className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/catalogo')}
                aria-label="Navegar para o catálogo"
                className="shadow-lg shadow-brand-primary/30"
              >
                Ver Catálogo
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
              {whatsappLink && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.open(whatsappLink, '_blank', 'noopener,noreferrer')}
                  aria-label="Falar com a Bianto Store no WhatsApp"
                  className="border-white/30 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15 hover:border-white/50 hover:text-white shadow-none"
                >
                  <MessageCircle size={16} className="text-emerald-400" aria-hidden="true" />
                  Falar no WhatsApp
                </Button>
              )}
            </motion.div>
          </motion.div>

          <motion.div
            variants={heroItemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-paper/15 bg-paper/8 p-6 backdrop-blur-md sm:p-7"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent">Linha em destaque</p>
            <h2 className="mt-2 font-display text-3xl text-paper sm:text-4xl">{siteSettings.content.benefitsTitle1}</h2>
            <p className="mt-3 text-sm leading-relaxed text-paper/80">
              {siteSettings.content.benefitsDesc1}
            </p>
            <div className="mt-5 grid gap-3 text-sm text-paper/90">
              {[siteSettings.content.benefitsTitle2, 'Pedido rápido via WhatsApp', siteSettings.content.benefitsTitle3].filter(Boolean).map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-accent/20">
                    <Check size={12} className="text-brand-accent" aria-hidden="true" />
                  </span>
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <motion.section
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">{siteSettings.content.navTitle}</p>
            <h2 className="mt-1 font-display text-3xl text-brand-text sm:text-4xl">{siteSettings.content.categoriesTitle}</h2>
          </div>
        </div>

        {isLoadingCategories && (
          <div className="rounded-2xl border border-brand-surface bg-white p-5 text-sm text-brand-primary">
            Carregando categorias cadastradas...
          </div>
        )}

        {!isLoadingCategories && categoriesError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            Não foi possível carregar categorias agora: {categoriesError}
          </div>
        )}

        {!isLoadingCategories && !categoriesError && primaryCategories.length === 0 && (
          <div className="rounded-2xl border border-brand-surface bg-white p-5 text-sm text-brand-primary">
            Nenhuma categoria em destaque no momento.
          </div>
        )}

        {!isLoadingCategories && !categoriesError && primaryCategories.length > 0 && (
          <div className="group relative w-full">
            <button
              type="button"
              onClick={() => scrollCategoriesCarousel('left')}
              className="absolute left-[-12px] top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-brand-surface bg-white text-brand-primary shadow-md transition-all duration-200 hover:bg-brand-bg hover:text-brand-text hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/35 sm:left-[-20px]"
              aria-label="Rolar categorias para a esquerda"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => scrollCategoriesCarousel('right')}
              className="absolute right-[-12px] top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-brand-surface bg-white text-brand-primary shadow-md transition-all duration-200 hover:bg-brand-bg hover:text-brand-text hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/35 sm:right-[-20px]"
              aria-label="Rolar categorias para a direita"
            >
              <ChevronRight size={22} />
            </button>

            <div
              ref={categoriesCarouselRef}
              className="flex items-stretch snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-1"
            >
              {primaryCategories.map((category, index) => (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => navigate(buildCatalogLink({ categoryId: category.id }))}
                  aria-label={`Abrir categoria ${category.name}`}
                  className="group relative h-64 w-[260px] min-w-[260px] flex-none snap-start overflow-hidden rounded-2xl border border-brand-surface/50 bg-brand-text text-left shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.35), ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(43,43,43,0.35)' }}
                >
                  <img
                    src={categoryPreviewImageById[category.id] || DEFAULT_PRODUCT_IMAGE}
                    alt={`Imagem da categoria ${category.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-2xl font-semibold text-white">{category.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-white/85">
                      {category.description || categoryDescriptions[category.slug] || 'Itens personalizados sob consulta.'}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white">
                      Ver produtos
                      <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.section>

      {/* Featured Products Section */}
      <motion.section
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Curadoria</p>
            <h2 className="mt-1 font-display text-3xl text-brand-text sm:text-4xl">{siteSettings.content.productsTitle}</h2>
          </div>
          <Button 
            variant="primary" 
            size="md" 
            className="flex items-center gap-2 px-6 transition-transform hover:-translate-y-0.5"
            onClick={() => navigate('/catalogo')} 
            aria-label="Ver todos os produtos"
          >
            Ver todos
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>

        <div className="group relative w-full">
          {featuredProducts.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => scrollProductsCarousel('left')}
                className="absolute left-[-12px] top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-brand-surface bg-white text-brand-primary shadow-md transition-all duration-200 hover:bg-brand-bg hover:text-brand-text hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/35 sm:left-[-20px]"
                aria-label="Rolar para a esquerda"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => scrollProductsCarousel('right')}
                className="absolute right-[-12px] top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-brand-surface bg-white text-brand-primary shadow-md transition-all duration-200 hover:bg-brand-bg hover:text-brand-text hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/35 sm:right-[-20px]"
                aria-label="Rolar para a direita"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
          <div 
            ref={productsCarouselRef}
            className="flex items-stretch snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-1"
          >
            {isLoading && (
              <article className="w-[260px] min-w-[260px] flex-none snap-start overflow-hidden rounded-2xl border border-brand-surface bg-white p-4 shadow-sm">
                <p className="text-sm text-brand-primary">Carregando produtos em destaque...</p>
              </article>
            )}

            {!isLoading && productsError && (
              <article className="w-[260px] min-w-[260px] flex-none snap-start overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                <p className="text-sm text-amber-900">Não foi possível carregar os produtos: {productsError}</p>
              </article>
            )}

            {!isLoading && !productsError && featuredProducts.length === 0 && (
              <article className="w-[260px] min-w-[260px] flex-none snap-start overflow-hidden rounded-2xl border border-brand-surface bg-white p-4 shadow-sm">
                <p className="text-sm text-brand-primary">Nenhum produto marcado como destaque no momento.</p>
              </article>
            )}

            {featuredProducts.map((product) => (
              <div key={product.id} className="w-[260px] min-w-[260px] flex-none snap-start">
                <ProductCard
                  product={product}
                  variant="carousel"
                  onOpenDetails={(currentProduct) => setSelectedProductDetails(currentProduct)}
                  onSelect={(currentProduct) =>
                    addItem(currentProduct.id, currentProduct.minQuantity, '', currentProduct.minQuantity)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {contactLinks.length > 0 && (
        <motion.section
          className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="rounded-2xl border border-brand-text/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Canais oficiais</p>
              <h2 className="mt-1 font-display text-3xl text-brand-text sm:text-4xl">Fale com a Bianto Store</h2>
            </div>

            <motion.div
              className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {contactLinks.map((contact) => (
                <motion.a
                  key={contact.id}
                  href={contact.href}
                  target={/^https?:\/\//i.test(contact.href) ? '_blank' : undefined}
                  rel={/^https?:\/\//i.test(contact.href) ? 'noopener noreferrer' : undefined}
                  variants={staggerItemVariants}
                  whileHover={{ y: -3, boxShadow: '0 8px 24px -6px rgba(43,43,43,0.15)' }}
                  className="group rounded-2xl border border-brand-surface bg-brand-bg p-4 transition-colors duration-200 hover:border-brand-primary/30"
                >
                  <div className="flex items-start gap-3">
                    <ContactLogo kind={contact.kind} />
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-text">{contact.title}</span>
                      <p className="mt-1 line-clamp-2 text-sm text-brand-primary">{contact.value}</p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* How it Works Section */}
      <motion.section
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="rounded-2xl border border-brand-text/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Processo simples</p>
            <h2 className="mt-1 font-display text-3xl text-brand-text sm:text-4xl">Como funciona</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-brand-primary">
              Monte seu pedido em poucos passos e receba direto pelo WhatsApp.
            </p>
          </div>

          <motion.div
            className="grid gap-6 md:grid-cols-3 md:gap-4"
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                title: 'Escolha os produtos no catálogo',
                description: 'Navegue pelas categorias e selecione os itens que combinam com seu projeto.',
                Icon: ShoppingBag,
              },
              {
                title: 'Personalize quantidade e observações',
                description: 'Defina quantidades, cores, frases e acabamentos para cada item.',
                Icon: Check,
              },
              {
                title: 'Envie a seleção direto no WhatsApp',
                description: 'Com um clique, sua lista vai direto para nossa equipe iniciar o orçamento.',
                Icon: MessageCircle,
              },
            ].map(({ title, description, Icon }, index) => (
              <motion.article
                key={title}
                variants={staggerItemVariants}
                whileHover={{ y: -4, backgroundColor: 'rgba(237,230,222,1)' }}
                className="relative flex flex-col items-center rounded-2xl bg-brand-bg/50 p-6 text-center"
              >
                <motion.span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Icon size={22} aria-hidden="true" />
                </motion.span>
                <span className="mt-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent/15 font-mono text-xs font-bold text-brand-accent">
                  {index + 1}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-brand-text">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-primary">{description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section
        className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8"
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-brand-text p-6 text-white shadow-xl sm:p-10">
          <motion.div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-primary/20 blur-[80px]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-accent/15 blur-[60px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent">Atendimento rápido</p>
              <h2 className="mt-1 font-display text-3xl text-white sm:text-4xl">Pronto para fazer seu pedido?</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
                Fale com a equipe da Bianto Store e receba valores, prazo e opções de personalização sob medida.
              </p>
            </div>

            <Button
              variant="whatsapp"
              size="lg"
              className="shrink-0 shadow-lg shadow-emerald-900/25 transition-all duration-300 hover:-translate-y-0.5"
              onClick={() => {
                if (whatsappLink) {
                  window.open(whatsappLink, '_blank', 'noopener,noreferrer')
                  return
                }

                if (fallbackContactLink) {
                  window.open(fallbackContactLink, '_blank', 'noopener,noreferrer')
                  return
                }

                if (siteSettings.contactEmail.trim()) {
                  window.location.href = `mailto:${siteSettings.contactEmail.trim()}`
                  return
                }

                window.alert('Configure um canal de contato no Admin para habilitar este botão.')
              }}
              aria-label="Abrir contato direto no WhatsApp"
            >
              <MessageCircle size={16} aria-hidden="true" />
              {whatsappLink ? 'Contato direto no WhatsApp' : 'Abrir canal de atendimento'}
            </Button>
          </div>
        </div>
      </motion.section>

      {selectedProductDetails && (
        <ProductDetailModal
          product={selectedProductDetails}
          onClose={() => setSelectedProductDetails(null)}
          onAddToSelection={(productId, quantity, note) => {
            addItem(productId, quantity, note, selectedProductDetails.minQuantity);
            setSelectedProductDetails(null);
          }}
        />
      )}
    </div>
  )
}
