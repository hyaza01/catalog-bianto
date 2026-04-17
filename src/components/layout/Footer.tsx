import { Globe, Heart, MessageCircle, Phone } from 'lucide-react'
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
    <footer className="border-t border-brand-text/10 bg-brand-text text-paper">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-8 pt-8 sm:gap-8 sm:px-6 sm:pb-10 sm:pt-10 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2.5">
              <span className="rounded-lg border border-paper/20 bg-paper/10 px-2.5 py-1 text-xs font-bold tracking-[0.2em] text-paper">BIANTO</span>
              <span className="font-display text-xl text-paper">Store</span>
            </div>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-paper/75">
              Presentes personalizados para marcas e momentos especiais.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {primaryLink && (
              <a
                href={primaryLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-paper/20 text-paper/80 transition-all duration-200 hover:border-paper/40 hover:bg-paper/10 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
                aria-label="Abrir link oficial da Bianto Store"
              >
                <Globe size={16} aria-hidden="true" />
              </a>
            )}
            <a
              href={whatsappContactLink || normalizeExternalUrl(settings.supportLink) || '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-paper/20 text-paper/80 transition-all duration-200 hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
              aria-label="Abrir WhatsApp da Bianto Store"
            >
              <MessageCircle size={16} aria-hidden="true" />
            </a>
            <span className="inline-flex items-center gap-2 rounded-xl border border-paper/15 bg-paper/5 px-3.5 py-2 text-sm text-paper/80">
              <Phone size={14} aria-hidden="true" />
              {contactPhoneDisplay || 'Configure contatos no Admin'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-paper/10 pt-6 sm:flex-row">
          <p className="text-xs text-paper/55">© {new Date().getFullYear()} Bianto Store. Todos os direitos reservados.</p>
          <p className="inline-flex items-center gap-1 text-xs text-paper/45">
            Feito com <Heart size={12} className="text-brand-accent" aria-hidden="true" /> para marcas que encantam
          </p>
        </div>
      </div>
    </footer>
  )
}
