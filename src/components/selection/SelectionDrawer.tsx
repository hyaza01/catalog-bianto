import { useEffect } from 'react'
import { FileDown, MessageCircle, Minus, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProducts } from '../../hooks/useProducts'
import { useSelection } from '../../hooks/useSelection'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { useSelectionStore } from '../../store/selectionStore'
import { formatBRL } from '../../utils/format'
import { resolveBrazilWhatsAppNumber } from '../../utils/phone'
import { exportSelectionToPdf } from '../../utils/pdf'
import { sendSelectionToWhatsApp } from '../../utils/whatsapp'
import { Button } from '../ui/Button'
import { CloseButton } from '../ui/CloseButton'
import { ProductImage } from '../common/ProductImage'
import { drawerVariants, overlayVariants, EASE_OUT_EXPO } from '../../utils/animations'

interface SelectionDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const SelectionDrawer = ({ isOpen, onClose }: SelectionDrawerProps) => {
  const { data: products, isLoading: isLoadingProducts } = useProducts()
  const { settings: siteSettings } = useSiteSettings()
  const { items, detailedItems, totalQuantity } = useSelection(products)
  const updateQuantity = useSelectionStore((state) => state.updateQuantity)
  const updateNote = useSelectionStore((state) => state.updateNote)
  const removeItem = useSelectionStore((state) => state.removeItem)

  // Remove orphaned items (products deleted from catalog but still in cart local storage)
  useEffect(() => {
    if (!isLoadingProducts && products && products.length > 0) {
      if (items.length > detailedItems.length) {
        const catalogIds = new Set(products.map((p) => p.id))
        items.forEach((item) => {
          if (!catalogIds.has(item.productId)) {
            removeItem(item.productId)
          }
        })
      }
    }
  }, [isLoadingProducts, products, items, detailedItems.length, removeItem])

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return
    }

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [isOpen])

  const estimatedTotal = detailedItems.reduce(
    (accumulator, item) => accumulator + item.product.price * item.quantity,
    0,
  )

  const handleWhatsAppSend = (): void => {
    const targetWhatsAppNumber = resolveBrazilWhatsAppNumber([
      siteSettings.whatsappNumber,
      siteSettings.contactPhone,
      import.meta.env.VITE_WHATSAPP_NUMBER,
    ])

    const sent = sendSelectionToWhatsApp(detailedItems, targetWhatsAppNumber)

    if (!sent) {
      window.alert('Nao foi possivel abrir o WhatsApp. Defina o numero no Admin em Configuracoes do Site.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/45"
            onClick={onClose}
            aria-hidden="true"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          <motion.aside
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-hidden border-l border-navy/10 bg-white shadow-2xl"
            aria-label="Painel de selecao de produtos"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex h-full min-h-0 flex-col">
              <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
                <div>
                  <h2 className="font-display text-2xl text-navy">Sua selecao</h2>
                  <p className="text-sm text-slate-500">{totalQuantity} itens no total</p>
                </div>
                <CloseButton
                  onClick={onClose}
                  aria-label="Fechar painel de selecao"
                  className="shrink-0"
                />
              </header>

              <div className="flex-1 min-h-0 space-y-3 overflow-y-auto overscroll-contain p-4 touch-pan-y sm:p-5">
                {isLoadingProducts && totalQuantity > 0 && detailedItems.length === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                    <p className="font-medium text-navy">Carregando os itens da sua selecao...</p>
                    <p className="mt-1 text-sm text-slate-500">Estamos buscando os produtos mais recentes no catalogo.</p>
                  </div>
                )}

                {!isLoadingProducts && detailedItems.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="font-medium text-navy">Nenhum item selecionado ainda.</p>
                    <p className="mt-1 text-sm text-slate-500">Adicione produtos no catalogo para montar seu pedido.</p>
                  </div>
                )}

                {detailedItems.map((item, index) => {
                  const minimumAllowedQuantity = Math.max(1, item.product.minQuantity)

                  return (
                    <motion.article
                      key={item.productId}
                      className="rounded-2xl border border-slate-200 p-3 shadow-sm transition hover:border-navy/20"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.4, delay: index * 0.05, ease: [...EASE_OUT_EXPO] }}
                    >
                      <div className="flex gap-3">
                        <ProductImage
                          src={item.product.images[0]}
                          alt={`Imagem do produto ${item.product.name}`}
                          className="h-20 w-20 rounded-xl object-contain"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-navy">{item.product.name}</p>
                          <p className="text-sm text-slate-500">{formatBRL(item.product.price)} por unidade</p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-crimson transition hover:text-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                            aria-label={`Remover ${item.product.name} da selecao`}
                          >
                            <Trash2 size={13} aria-hidden="true" />
                            Remover
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3">
                        <div className="grid gap-1 text-sm font-medium text-slate-700">
                          <span>Quantidade</span>

                          <div className="inline-flex h-10 w-fit items-center rounded-md border border-gray-300 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  Math.max(minimumAllowedQuantity, item.quantity - 1),
                                  minimumAllowedQuantity,
                                )
                              }
                              disabled={item.quantity <= minimumAllowedQuantity}
                              aria-label={`Diminuir quantidade de ${item.product.name}`}
                              className="inline-flex h-full items-center justify-center px-3 py-1 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                            >
                              <Minus size={14} aria-hidden="true" />
                            </button>

                            <span className="inline-flex w-8 items-center justify-center border-x border-gray-300 text-center text-sm font-semibold text-gray-800">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  Math.max(minimumAllowedQuantity, item.quantity + 1),
                                  minimumAllowedQuantity,
                                )
                              }
                              aria-label={`Aumentar quantidade de ${item.product.name}`}
                              className="inline-flex h-full items-center justify-center px-3 py-1 text-gray-700 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                            >
                              <Plus size={14} aria-hidden="true" />
                            </button>
                          </div>

                          <span className="text-xs font-normal text-slate-500">Minimo: {minimumAllowedQuantity}</span>
                        </div>

                        <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor={`note-${item.productId}`}>
                          Observacao
                          <textarea
                            id={`note-${item.productId}`}
                            aria-label={`Observacao para ${item.product.name}`}
                            value={item.note}
                            onChange={(event) => updateNote(item.productId, event.target.value)}
                            rows={2}
                            placeholder="Cor, frase, logo ou acabamento"
                            className="resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                          />
                        </label>
                      </div>
                    </motion.article>
                  )
                })}
              </div>

              <footer className="shrink-0 border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">Estimativa total:</span>
                  <span className="font-mono text-lg font-semibold text-navy">{formatBRL(estimatedTotal)}</span>
                </div>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      void exportSelectionToPdf(detailedItems)
                    }}
                    disabled={detailedItems.length === 0}
                    fullWidth
                    aria-label="Exportar selecao para PDF"
                  >
                    <FileDown size={16} aria-hidden="true" />
                    Exportar PDF
                  </Button>
                  <Button
                    variant="whatsapp"
                    onClick={handleWhatsAppSend}
                    disabled={detailedItems.length === 0}
                    fullWidth
                    aria-label="Enviar selecao pelo WhatsApp"
                  >
                    <MessageCircle size={16} aria-hidden="true" />
                    Enviar pelo WhatsApp
                  </Button>
                </div>
              </footer>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
