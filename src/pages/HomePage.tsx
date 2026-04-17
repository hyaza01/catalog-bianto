import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react'
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
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants'

const categoryDescriptions: Record<string, string> = {
  canecas: 'Modelos classicos e premium para presentear.',
  'garrafas-termicas': 'Termicas duraveis para rotina e eventos.',
  copos: 'Copos modernos para brindes e festas.',
  'kits-especiais': 'Combinacoes prontas para encantar clientes.',
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
      <section
        className="relative overflow-hidden border-b border-navy/10"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(43, 43, 43, 0.94), rgba(95, 111, 90, 0.86), rgba(122, 143, 115, 0.72)), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-paper/25 bg-paper/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-paper">
              Catalogo Premium
            </p>
            <h1 className="font-display text-5xl leading-tight text-paper sm:text-6xl">
              Bianto Store
              <span className="block italic text-paper">Personalizados que marcam momentos</span>
            </h1>
            <p className="max-w-xl text-base text-paper/85 sm:text-lg">
              Canecas, garrafas termicas, copos e kits especiais com design sofisticado para presentes
              corporativos e datas memoraveis.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/catalogo')}
                aria-label="Navegar para o catalogo"
              >
                Ver Catalogo
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
              {whatsappLink && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.open(whatsappLink, '_blank', 'noopener,noreferrer')}
                  aria-label="Falar com a Bianto Store no WhatsApp"
                  className="border border-white/40 bg-white/5 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white hover:text-white"
                >
                  <MessageCircle size={16} className="text-green-400" aria-hidden="true" />
                  Falar no WhatsApp
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-paper/20 bg-paper/10 p-6 backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-paper/75">Linha em destaque</p>
            <h2 className="mt-2 font-display text-4xl text-paper">Kits assinatura</h2>
            <p className="mt-3 text-sm leading-relaxed text-paper/85">
              Monte kits elegantes combinando garrafas, canecas e brindes extras com personalizacao completa.
            </p>
            <div className="mt-5 grid gap-3 text-sm text-paper/90">
              {['Personalizacao total', 'Pedido rapido via WhatsApp', 'Acabamento premium'].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check size={16} className="text-amber" aria-hidden="true" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Navegacao rapida</p>
            <h2 className="font-display text-4xl text-navy">Categorias em destaque</h2>
          </div>
        </div>

        {isLoadingCategories && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
            Carregando categorias cadastradas...
          </div>
        )}

        {!isLoadingCategories && categoriesError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            Nao foi possivel carregar categorias agora: {categoriesError}
          </div>
        )}

        {!isLoadingCategories && !categoriesError && primaryCategories.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Nenhuma categoria em destaque no momento.
          </div>
        )}

        {!isLoadingCategories && !categoriesError && primaryCategories.length > 0 && (
          <div className="group relative w-full">
            <button
              type="button"
              onClick={() => scrollCategoriesCarousel('left')}
              className="absolute left-[-16px] top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#D8C8B8] bg-white text-[#5F6F5A] shadow-md transition-colors hover:bg-[#FDFCFB] hover:text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#5F6F5A]/35 sm:left-[-24px]"
              aria-label="Rolar categorias para a esquerda"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={() => scrollCategoriesCarousel('right')}
              className="absolute right-[-16px] top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#D8C8B8] bg-white text-[#5F6F5A] shadow-md transition-colors hover:bg-[#FDFCFB] hover:text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#5F6F5A]/35 sm:right-[-24px]"
              aria-label="Rolar categorias para a direita"
            >
              <ChevronRight size={24} />
            </button>

            <div
              ref={categoriesCarouselRef}
              className="flex items-stretch snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-1"
            >
              {primaryCategories.map((category, index) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => navigate(buildCatalogLink({ categoryId: category.id }))}
                  aria-label={`Abrir categoria ${category.name}`}
                  className="group relative h-64 w-[260px] min-w-[260px] flex-none snap-start overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-crimson/30 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                  style={{ transitionDelay: `${index * 35}ms` }}
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
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Curadoria</p>
            <h2 className="font-display text-4xl text-navy">Produtos em destaque</h2>
          </div>
          <Button 
            variant="primary" 
            size="md" 
            className="flex items-center gap-2 px-6 shadow-md transition-transform hover:-translate-y-0.5"
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
                className="absolute left-[-16px] top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#D8C8B8] bg-white text-[#5F6F5A] shadow-md transition-colors hover:bg-[#FDFCFB] hover:text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#5F6F5A]/35 sm:left-[-24px]"
                aria-label="Rolar para a esquerda"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={() => scrollProductsCarousel('right')}
                className="absolute right-[-16px] top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#D8C8B8] bg-white text-[#5F6F5A] shadow-md transition-colors hover:bg-[#FDFCFB] hover:text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#5F6F5A]/35 sm:right-[-24px]"
                aria-label="Rolar para a direita"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <div 
            ref={productsCarouselRef}
            className="flex items-stretch snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-1"
          >
            {isLoading && (
              <article className="w-[260px] min-w-[260px] flex-none snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Carregando produtos em destaque...</p>
              </article>
            )}

            {!isLoading && productsError && (
              <article className="w-[260px] min-w-[260px] flex-none snap-start overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                <p className="text-sm text-amber-900">Nao foi possivel carregar os produtos: {productsError}</p>
              </article>
            )}

            {!isLoading && !productsError && featuredProducts.length === 0 && (
              <article className="w-[260px] min-w-[260px] flex-none snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-600">Nenhum produto marcado como destaque no momento.</p>
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
      </section>

      {contactLinks.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Canais oficiais</p>
              <h2 className="font-display text-4xl text-navy">Fale com a Bianto Store</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {contactLinks.map((contact) => (
                <a
                  key={contact.id}
                  href={contact.href}
                  target={/^https?:\/\//i.test(contact.href) ? '_blank' : undefined}
                  rel={/^https?:\/\//i.test(contact.href) ? 'noopener noreferrer' : undefined}
                  className="group rounded-2xl border border-slate-200 bg-offwhite p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-crimson/40"
                >
                  <div className="flex items-start gap-3">
                    <ContactLogo kind={contact.kind} />
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">{contact.title}</span>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{contact.value}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Processo simples</p>
            <h2 className="font-display text-4xl text-navy">Como funciona</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Escolha os produtos no catalogo',
                Icon: ShoppingBag,
              },
              {
                title: 'Personalize quantidade e observacoes',
                Icon: Check,
              },
              {
                title: 'Envie a selecao direto no WhatsApp',
                Icon: MessageCircle,
              },
            ].map(({ title, Icon }, index) => (
              <article
                key={title}
                className="flex flex-col items-center rounded-2xl bg-offwhite p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-sm"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-crimson/10 text-crimson">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="mt-4 inline-flex rounded-full bg-rose-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-crimson">
                  Passo {index + 1}
                </span>
                <p className="mt-3 text-sm font-medium text-slate-700">{title}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-white/80">Atendimento rapido</p>
              <h2 className="font-display text-4xl text-white">Pronto para fazer seu pedido?</h2>
              <p className="mt-2 max-w-xl text-sm text-white/90">
                Fale com a equipe da Bianto Store e receba valores, prazo e opcoes de personalizacao.
              </p>
            </div>

            <Button
              variant="whatsapp"
              size="lg"
              className="shadow-lg shadow-green-900/25 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-white"
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

                window.alert('Configure um canal de contato no Admin para habilitar este botao.')
              }}
              aria-label="Abrir contato direto no WhatsApp"
            >
              <MessageCircle size={16} aria-hidden="true" />
              {whatsappLink ? 'Contato direto no WhatsApp' : 'Abrir canal de atendimento'}
            </Button>
          </div>
        </div>
      </section>

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
