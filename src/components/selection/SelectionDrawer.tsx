import { useEffect } from 'react'
import { FileDown, MessageCircle, Minus, Plus, Trash2, X } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { useSelection } from '../../hooks/useSelection'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { useSelectionStore } from '../../store/selectionStore'
import { formatBRL } from '../../utils/format'
import { resolveBrazilWhatsAppNumber } from '../../utils/phone'
import { exportSelectionToPdf } from '../../utils/pdf'
import { sendSelectionToWhatsApp } from '../../utils/whatsapp'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'
import { ProductImage } from '../common/ProductImage'

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
      window.alert('Não foi possível abrir o WhatsApp. Defina o número no Admin em Configurações do Site.')
    }
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/45 transition-opacity duration-200',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-md transform border-l border-brand-text/10 bg-white shadow-2xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-label="Painel de seleção de produtos"
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-brand-surface px-4 py-4 sm:px-5">
            <div>
              <h2 className="font-display text-2xl text-brand-text">Sua seleção</h2>
              <p className="text-sm text-brand-primary">{totalQuantity} itens no total</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-surface text-brand-primary transition-all duration-200 hover:border-brand-primary/30 hover:text-brand-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              aria-label="Fechar painel de seleção"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
            {isLoadingProducts && totalQuantity > 0 && detailedItems.length === 0 && (
              <div className="rounded-2xl border border-brand-surface bg-brand-bg p-6 text-center">
                <p className="font-medium text-brand-text">Carregando os itens da sua seleção...</p>
                <p className="mt-1 text-sm text-brand-primary">Estamos buscando os produtos mais recentes no catálogo.</p>
              </div>
            )}

            {!isLoadingProducts && detailedItems.length === 0 && (
              <div className="rounded-2xl border border-dashed border-brand-surface bg-brand-bg/50 p-6 text-center">
                <p className="font-medium text-brand-text">Nenhum item selecionado ainda</p>
                <p className="mt-1 text-sm text-brand-primary">Adicione produtos no catálogo para montar seu pedido.</p>
              </div>
            )}

            {detailedItems.map((item) => {
              const minimumAllowedQuantity = Math.max(1, item.product.minQuantity)

              return (
                <article
                  key={item.productId}
                  className="rounded-2xl border border-brand-surface p-3 shadow-sm transition hover:border-brand-primary/20"
                >
                  <div className="flex gap-3">
                    <ProductImage
                      src={item.product.images[0]}
                      alt={`Imagem do produto ${item.product.name}`}
                      className="h-20 w-20 rounded-xl object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-brand-text">{item.product.name}</p>
                      <p className="text-sm text-brand-primary">{formatBRL(item.product.price)} por unidade</p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600 transition hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                        aria-label={`Remover ${item.product.name} da selecao`}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        Remover
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3">
                    <div className="grid gap-1 text-sm font-medium text-brand-text">
                      <span>Quantidade</span>

                      <div className="inline-flex h-10 w-fit items-center rounded-xl border border-brand-surface bg-white">
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
                          className="inline-flex h-full items-center justify-center px-3 py-1 text-brand-text transition hover:bg-brand-bg disabled:cursor-not-allowed disabled:text-brand-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                        >
                          <Minus size={14} aria-hidden="true" />
                        </button>

                        <span className="inline-flex w-8 items-center justify-center border-x border-brand-surface text-center text-sm font-semibold text-brand-text">
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
                          className="inline-flex h-full items-center justify-center px-3 py-1 text-brand-text transition hover:bg-brand-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                        >
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>

                      <span className="text-xs font-normal text-brand-primary">
                        Mínimo: {minimumAllowedQuantity}
                      </span>
                    </div>

                    <label className="grid gap-1 text-sm font-medium text-brand-text" htmlFor={`note-${item.productId}`}>
                      Observação
                      <textarea
                        id={`note-${item.productId}`}
                        aria-label={`Observação para ${item.product.name}`}
                        value={item.note}
                        onChange={(event) => updateNote(item.productId, event.target.value)}
                        rows={2}
                        placeholder="Cor, frase, logo ou acabamento"
                        className="resize-none rounded-xl border border-brand-surface px-3 py-2 text-sm text-brand-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                      />
                    </label>
                  </div>
                </article>
              )
            })}
          </div>

          <footer className="border-t border-brand-surface bg-brand-bg/50 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="font-medium text-brand-primary">Estimativa total:</span>
              <span className="font-mono text-lg font-semibold text-brand-text">{formatBRL(estimatedTotal)}</span>
            </div>
            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  void exportSelectionToPdf(detailedItems)
                }}
                disabled={detailedItems.length === 0}
                fullWidth
                aria-label="Exportar seleção para PDF"
              >
                <FileDown size={16} aria-hidden="true" />
                Exportar PDF
              </Button>
              <Button
                variant="whatsapp"
                onClick={handleWhatsAppSend}
                disabled={detailedItems.length === 0}
                fullWidth
                aria-label="Enviar seleção pelo WhatsApp"
              >
                <MessageCircle size={16} aria-hidden="true" />
                Enviar pelo WhatsApp
              </Button>
            </div>
          </footer>
        </div>
      </aside>
    </>
  )
}
