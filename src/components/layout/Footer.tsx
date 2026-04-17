import { Globe, MessageCircle, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { formatBrazilPhoneDisplay, resolveBrazilWhatsAppNumber } from '../../utils/phone'
import { buildDirectWhatsAppMessage, createDirectWhatsAppLink } from '../../utils/whatsapp'
import { EASE_OUT_EXPO } from '../../utils/animations'

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
    <footer className="border-t border-navy/10 bg-navy text-paper relative overflow-hidden">
      {/* Animated gradient accent */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(95, 111, 90, 0.3), transparent 60%)' }}
        animate={{
          background: [
            'radial-gradient(ellipse at 20% 50%, rgba(95, 111, 90, 0.3), transparent 60%)',
            'radial-gradient(ellipse at 80% 50%, rgba(201, 164, 106, 0.2), transparent 60%)',
            'radial-gradient(ellipse at 20% 50%, rgba(95, 111, 90, 0.3), transparent 60%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-8 sm:gap-8 sm:px-6 sm:py-10 lg:px-8">
        <motion.div
          className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [...EASE_OUT_EXPO] }}
        >
          <div>
            <p className="font-display text-2xl">Bianto Store</p>
            <p className="mt-1 max-w-md text-sm text-paper/80">
              Presentes personalizados para marcas e momentos especiais.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {primaryLink && (
              <motion.a
                href={primaryLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-paper/25 text-paper transition hover:bg-paper/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
                aria-label="Abrir link oficial da Bianto Store"
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe size={16} aria-hidden="true" />
              </motion.a>
            )}
            <motion.a
              href={whatsappContactLink || normalizeExternalUrl(settings.supportLink) || '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-paper/25 text-paper transition hover:bg-paper/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
              aria-label="Abrir WhatsApp da Bianto Store"
              whileHover={{ scale: 1.15, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle size={16} aria-hidden="true" />
            </motion.a>
            <span className="inline-flex items-center gap-2 rounded-full border border-paper/20 px-3 py-2 text-sm text-paper/85">
              <Phone size={14} aria-hidden="true" />
              {contactPhoneDisplay || 'Configure contatos no Admin'}
            </span>
          </div>
        </motion.div>

        {/* Animated separator line */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-paper/20 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [...EASE_OUT_EXPO] }}
        />

        <motion.p
          className="text-xs text-paper/65"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Copyright {new Date().getFullYear()} Bianto Store. Todos os direitos reservados.
        </motion.p>
      </div>
    </footer>
  )
}
