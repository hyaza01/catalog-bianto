import type { SelectionItemDetailed } from '../types/selection'
import { toBrazilWhatsAppNumber } from './phone'
import { formatBRL } from './format'

const calculateEstimatedTotal = (items: SelectionItemDetailed[]): number =>
  items.reduce((accumulator, item) => accumulator + item.product.price * item.quantity, 0)

const normalizeMessageText = (message: string): string =>
  message
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim()

const encodeWhatsAppText = (message: string): string => encodeURIComponent(normalizeMessageText(message))

export const buildDirectWhatsAppMessage = (): string => {
  const lines: string[] = []

  lines.push('Ola! Vim pelo site da Bianto Store e gostaria de atendimento.')

  lines.push('Tenho interesse em produtos personalizados e kits sob medida.')
  lines.push('Podem me enviar opções, valores e prazo de produção?')

  return lines.join('\n')
}

export const buildWhatsAppMessage = (items: SelectionItemDetailed[], totalValue?: number): string => {
  const estimatedTotal = Number.isFinite(totalValue) ? Math.max(0, totalValue ?? 0) : calculateEstimatedTotal(items)
  const lines: string[] = []

  lines.push('Ola! Vim pelo site da Bianto Store e gostaria de fechar este pedido.')
  lines.push('')
  lines.push('*RESUMO DO PEDIDO*')
  lines.push('')

  items.forEach((item, index) => {
    const observation = item.note.trim().length > 0 ? ` | Observação: ${item.note.trim()}` : ''
    const subtotal = item.product.price * item.quantity
    lines.push(
      `${index + 1}. *${item.product.name}* - Qtd: ${item.quantity} | Unit: ${formatBRL(item.product.price)} | Subtotal: ${formatBRL(subtotal)}${observation}`,
    )
  })

  lines.push('')
  lines.push(`*TOTAL ESTIMADO:* ${formatBRL(estimatedTotal)}`)
  lines.push('')
  lines.push('Podem confirmar, por favor:')
  lines.push('- valor final do pedido')
  lines.push('- prazo de produção')
  lines.push('- formas de pagamento')

  return lines.join('\n')
}

export const createDirectWhatsAppLink = (customPhoneNumber?: string, customMessage?: string): string | null => {
  const phoneNumber = toBrazilWhatsAppNumber(customPhoneNumber || import.meta.env.VITE_WHATSAPP_NUMBER)

  if (!phoneNumber) {
    return null
  }

  const text = customMessage?.trim() ? customMessage : buildDirectWhatsAppMessage()
  return `https://wa.me/${phoneNumber}?text=${encodeWhatsAppText(text)}`
}

export const generateWhatsAppLink = (
  items: SelectionItemDetailed[],
  totalValue: number,
  customPhoneNumber?: string,
): string | null => {
  if (items.length === 0) {
    return null
  }

  const phoneNumber = toBrazilWhatsAppNumber(customPhoneNumber || import.meta.env.VITE_WHATSAPP_NUMBER)

  if (!phoneNumber) {
    return null
  }

  const message = encodeWhatsAppText(buildWhatsAppMessage(items, totalValue))
  return `https://wa.me/${phoneNumber}?text=${message}`
}

export const createWhatsAppLink = (items: SelectionItemDetailed[], customPhoneNumber?: string): string | null => {
  return generateWhatsAppLink(items, calculateEstimatedTotal(items), customPhoneNumber)
}

export const sendSelectionToWhatsApp = (items: SelectionItemDetailed[], customPhoneNumber?: string): boolean => {
  const url = generateWhatsAppLink(items, calculateEstimatedTotal(items), customPhoneNumber)

  if (!url) {
    return false
  }

  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}
