import { Check, Minus, Plus, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CATEGORY_LABELS, type Product } from '../../types/product'
import { formatBRL } from '../../utils/format'
import { Badge } from '../ui/Badge'
import { overlayVariants, modalVariants } from '../../utils/animations'
import { Button } from '../ui/Button'
import { CloseButton } from '../ui/CloseButton'
import { ProductImage } from '../common/ProductImage'

interface MetaDefinition {
  selector: string
  attribute: 'name' | 'property'
  key: string
  content: string
}

const upsertMetaTag = ({ selector, attribute, key, content }: MetaDefinition): (() => void) => {
  if (typeof document === 'undefined') {
    return () => {}
  }

  let meta = document.head.querySelector(selector) as HTMLMetaElement | null
  let wasCreated = false

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, key)
    meta.setAttribute('data-bianto-product-meta', 'true')
    document.head.appendChild(meta)
    wasCreated = true
  }

  const previousContent = meta.getAttribute('content')
  meta.setAttribute('content', content)

  return () => {
    if (wasCreated) {
      meta?.remove()
      return
    }

    if (previousContent === null) {
      meta?.removeAttribute('content')
      return
    }

    meta?.setAttribute('content', previousContent)
  }
}

interface ProductDetailModalProps {
  product: Product
  onClose: () => void
  onAddToSelection: (productId: string, quantity: number, note: string) => void
}

export const ProductDetailModal = ({ product, onClose, onAddToSelection }: ProductDetailModalProps) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isImageExpanded, setIsImageExpanded] = useState(false)
  const [quantity, setQuantity] = useState(product.minQuantity)
  const [note, setNote] = useState('')

  const currentImage = product.images[selectedImage] ?? product.images[0]

  useEffect(() => {
    if (!isImageExpanded || typeof document === 'undefined') {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsImageExpanded(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isImageExpanded])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const previousTitle = document.title
    const image = product.images[0] ?? ''
    const description =
      product.description.short?.trim() ||
      product.description.long.trim().slice(0, 150) ||
      `Conheca ${product.name} no catalogo da Bianto Store.`
    const pageTitle = `${product.name} | Bianto Store`
    const productUrl = `${window.location.origin}/catalogo?produto=${encodeURIComponent(product.id)}`

    document.title = pageTitle

    const cleanups: Array<() => void> = []

    cleanups.push(() => {
      document.title = previousTitle
    })

    const metaDefinitions: MetaDefinition[] = [
      {
        selector: 'meta[name="description"]',
        attribute: 'name',
        key: 'description',
        content: description,
      },
      {
        selector: 'meta[property="og:title"]',
        attribute: 'property',
        key: 'og:title',
        content: pageTitle,
      },
      {
        selector: 'meta[property="og:description"]',
        attribute: 'property',
        key: 'og:description',
        content: description,
      },
      {
        selector: 'meta[property="og:image"]',
        attribute: 'property',
        key: 'og:image',
        content: image,
      },
      {
        selector: 'meta[property="og:type"]',
        attribute: 'property',
        key: 'og:type',
        content: 'product',
      },
      {
        selector: 'meta[property="og:url"]',
        attribute: 'property',
        key: 'og:url',
        content: productUrl,
      },
    ]

    metaDefinitions.forEach((definition) => {
      cleanups.push(upsertMetaTag(definition))
    })

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description,
      image: product.images,
      category: product.categoryName || CATEGORY_LABELS[product.category],
      sku: product.id,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'BRL',
        price: product.price.toFixed(2),
        availability: product.flags.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: productUrl,
      },
    }

    if (typeof product.ratingAvg === 'number' && typeof product.reviewsCount === 'number' && product.reviewsCount > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.ratingAvg,
        reviewCount: Math.round(product.reviewsCount),
      }
    }

    const structuredDataScript = document.createElement('script')
    structuredDataScript.type = 'application/ld+json'
    structuredDataScript.setAttribute('data-bianto-product-jsonld', product.id)
    structuredDataScript.text = JSON.stringify(schema)
    document.head.appendChild(structuredDataScript)

    cleanups.push(() => {
      structuredDataScript.remove()
    })

    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [product])

  const safeRating =
    typeof product.ratingAvg === 'number' && Number.isFinite(product.ratingAvg)
      ? Math.max(0, Math.min(5, product.ratingAvg))
      : null
  const safeReviews =
    typeof product.reviewsCount === 'number' && product.reviewsCount > 0
      ? Math.round(product.reviewsCount)
      : null

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-black/55"
        onClick={onClose}
        aria-hidden="true"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      />

      {isImageExpanded && (
        <section
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          aria-label={`Visualizacao expandida da imagem de ${product.name}`}
          onClick={() => setIsImageExpanded(false)}
        >
          <CloseButton
            onClick={() => setIsImageExpanded(false)}
            aria-label="Fechar visualizacao expandida da imagem"
            tone="overlay"
            size="lg"
            className="absolute right-4 top-4"
          />

          <div
            className="mx-auto flex h-full w-full max-w-6xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <ProductImage
              src={currentImage}
              alt={`Imagem em tela cheia de ${product.name}`}
              className="max-h-[92vh] w-full"
              imgClassName="max-h-[92vh] w-full object-contain"
            />
          </div>
        </section>
      )}

      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-3"
        onClick={onClose}
      >
        <motion.section
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-2xl max-h-[90vh]"
          aria-label={`Detalhes do produto ${product.name}`}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="grid max-h-[90vh] grid-cols-1 overflow-y-auto md:grid-cols-[1.1fr_1fr]">
          <div className="border-b border-slate-200 p-4 md:border-b-0 md:border-r md:p-5">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl">
              <button
                type="button"
                onClick={() => setIsImageExpanded(true)}
                className="h-full w-full cursor-zoom-in"
                aria-label={`Expandir imagem principal de ${product.name}`}
              >
                <ProductImage
                  src={currentImage}
                  alt={`Imagem ampliada de ${product.name}`}
                  className="h-full w-full object-contain"
                />
              </button>
            </div>

            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    aria-label={`Selecionar imagem ${index + 1} de ${product.name}`}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-xl border transition ${
                      selectedImage === index ? 'border-crimson' : 'border-slate-200 hover:border-navy/30'
                    }`}
                  >
                    <ProductImage
                      src={image}
                      alt={`Miniatura ${index + 1} de ${product.name}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 md:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <Badge variant="category">{product.categoryName || CATEGORY_LABELS[product.category]}</Badge>
                <h2 className="mt-2 font-display text-3xl leading-tight text-navy">{product.name}</h2>
              </div>
              <CloseButton
                onClick={onClose}
                aria-label="Fechar detalhes do produto"
                className="shrink-0"
              />
            </div>

            <p className="text-sm leading-relaxed text-slate-600">{product.description.long}</p>

            <div className="mt-4 grid gap-2 text-sm">
              <p>
                <span className="font-medium text-slate-600">Preco unitario:</span>{' '}
                <span className="font-mono text-lg font-semibold text-crimson">{formatBRL(product.price)}</span>
              </p>
              <p>
                <span className="font-medium text-slate-600">Pedido minimo:</span> {product.minQuantity} unidades
              </p>
            </div>

            <div className="mt-4 grid gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm">
              {safeRating !== null && safeReviews !== null ? (
                <p className="inline-flex items-center gap-1 font-semibold text-emerald-900">
                  <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                  {safeRating.toFixed(1)} ({safeReviews} avaliacoes)
                </p>
              ) : (
                <p className="font-semibold text-emerald-900">Novo no catalogo</p>
              )}

              {product.productionTime && (
                <p className="text-emerald-800">Producao estimada em {product.productionTime}</p>
              )}
            </div>

            {product.variants?.sizes && product.variants.sizes.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700">Tamanhos disponiveis</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.variants.sizes.map((size) => (
                    <span key={size} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.variants?.colors && product.variants.colors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700">Cores disponiveis</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.variants.colors.map((color) => (
                    <span key={color} className="rounded-full bg-navy/10 px-3 py-1 text-xs font-medium text-navy">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <label className="mt-5 grid gap-1 text-sm font-medium text-slate-700" htmlFor="product-note">
              Observacao de personalizacao
              <textarea
                id="product-note"
                aria-label="Informar observacao para personalizacao"
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ex.: aplicar logo frontal, frase no verso e acabamento fosco"
                className="resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
              />
            </label>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Quantidade</p>
                <div className="mt-1 inline-flex items-center rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(product.minQuantity, current - 1))}
                    className="inline-flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <input
                    aria-label="Quantidade do produto"
                    type="number"
                    min={product.minQuantity}
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(product.minQuantity, Number(event.target.value) || 0))}
                    className="h-10 w-20 border-x border-slate-200 text-center font-medium text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="inline-flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  onAddToSelection(product.id, quantity, note)
                  onClose()
                }}
                disabled={!product.flags.isAvailable}
                aria-label="Adicionar produto a selecao"
              >
                <Check size={16} aria-hidden="true" />
                Adicionar a selecao
              </Button>
            </div>
          </div>
        </div>
      </motion.section>
      </div>
    </>
  )
}
