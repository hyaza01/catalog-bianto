import { Globe, MessageCircle, Phone } from 'lucide-react'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { formatBrazilPhoneDisplay, resolveBrazilWhatsAppNumber } from '../../utils/phone'
import { buildDirectWhatsAppMessage, createDirectWhatsAppLink } from '../../utils/whatsapp'

const normalizeExternalUrl = (rawUrl: string | undefined): string | null => {
  const trimmed = (rawUrl ?? '').trim()

  if (!trimmed) {
    return null
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}

export const Footer = () => {
  const { settings } = useSiteSettings()

  const whatsappNumber = resolveBrazilWhatsAppNumber([
    settings.whatsappNumber,
    settings.contactPhone,
    import.meta.env.VITE_WHATSAPP_NUMBER,
  ])
  const contactPhoneDisplay = formatBrazilPhoneDisplay(settings.contactPhone) || formatBrazilPhoneDisplay(whatsappNumber)
  const whatsappContactLink = whatsappNumber
    ? createDirectWhatsAppLink(whatsappNumber, buildDirectWhatsAppMessage()) || `https://wa.me/${whatsappNumber}`
    : null
  const primaryLink =
    normalizeExternalUrl(settings.instagramUrl) ||
    normalizeExternalUrl(settings.websiteUrl) ||
    normalizeExternalUrl(settings.supportLink)

  return (
    <footer className="border-t border-navy/10 bg-navy text-paper">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-8 sm:gap-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl">Bianto Store</p>
            <p className="mt-1 max-w-md text-sm text-paper/80">
              Presentes personalizados para marcas e momentos especiais.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {primaryLink && (
              <a
                href={primaryLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-paper/25 text-paper transition hover:bg-paper/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
                aria-label="Abrir link oficial da Bianto Store"
              >
                <Globe size={16} aria-hidden="true" />
              </a>
            )}
            <a
              href={whatsappContactLink || normalizeExternalUrl(settings.supportLink) || '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-paper/25 text-paper transition hover:bg-paper/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
              aria-label="Abrir WhatsApp da Bianto Store"
            >
              <MessageCircle size={16} aria-hidden="true" />
            </a>
            <span className="inline-flex items-center gap-2 rounded-full border border-paper/20 px-3 py-2 text-sm text-paper/85">
              <Phone size={14} aria-hidden="true" />
              {contactPhoneDisplay || 'Configure contatos no Admin'}
            </span>
          </div>
        </div>

        <p className="text-xs text-paper/65">Copyright {new Date().getFullYear()} Bianto Store. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
