import { MessageCircle } from 'lucide-react'
import type { SelectionItemDetailed } from '../../types/selection'
import { formatBRL } from '../../utils/format'
import { generateWhatsAppLink } from '../../utils/whatsapp'
import { Button } from '../ui/Button'

interface MobileCheckoutBarProps {
  isVisible: boolean
  items: SelectionItemDetailed[]
  totalItems: number
  totalValue: number
  whatsappNumber: string
  onOpenSelection: () => void
}

export const MobileCheckoutBar = ({
  isVisible,
  items,
  totalItems,
  totalValue,
  whatsappNumber,
  onOpenSelection,
}: MobileCheckoutBarProps) => {
  if (!isVisible) {
    return null
  }

  const handleSendOrder = () => {
    const whatsappUrl = generateWhatsAppLink(items, totalValue, whatsappNumber)

    if (!whatsappUrl) {
      window.alert('Nao foi possivel abrir o WhatsApp. Defina o numero no Admin em Configuracoes do Site.')
      return
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 block border-t border-brand-surface bg-white/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onOpenSelection}
          aria-label="Abrir resumo da selecao"
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-xs text-brand-primary">{totalItems} itens na seleção</p>
          <p className="truncate text-base font-extrabold text-brand-text">{formatBRL(totalValue)}</p>
        </button>

        <Button
          variant="whatsapp"
          size="sm"
          onClick={handleSendOrder}
          className="h-11 shrink-0 rounded-lg px-4 text-sm font-bold"
          aria-label="Enviar pedido pelo WhatsApp"
        >
          <MessageCircle size={16} aria-hidden="true" />
          Enviar Pedido
        </Button>
      </div>
    </div>
  )
}
