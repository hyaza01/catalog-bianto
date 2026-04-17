import { CheckCircle2, MessageCircle, Sparkles, Star } from 'lucide-react'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { formatBrazilPhoneDisplay, normalizePhoneDigits, resolveBrazilWhatsAppNumber } from '../utils/phone'
import { buildDirectWhatsAppMessage, createDirectWhatsAppLink } from '../utils/whatsapp'
import { Button } from '../components/ui/Button'
import { ContactLogo, type ContactKind } from '../components/common/ContactLogo'

type ContactLink = {
  id: string
  title: string
  value: string
  href: string
  kind: ContactKind
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

export const AboutPage = () => {
  const { settings } = useSiteSettings()

  const contactLinks = useMemo(() => {
    const links: ContactLink[] = []

    const whatsapp = resolveBrazilWhatsAppNumber([
      settings.whatsappNumber,
      settings.contactPhone,
      import.meta.env.VITE_WHATSAPP_NUMBER,
    ])

    if (whatsapp) {
      links.push({
        id: 'whatsapp',
        title: 'WhatsApp',
        value: formatBrazilPhoneDisplay(whatsapp),
        href:
          createDirectWhatsAppLink(
            whatsapp,
            buildDirectWhatsAppMessage(),
          ) || `https://wa.me/${whatsapp}`,
        kind: 'whatsapp',
      })
    }

    const phoneDigits = normalizePhoneDigits(settings.contactPhone)
    if (phoneDigits) {
      links.push({
        id: 'phone',
        title: 'Telefone',
        value: formatBrazilPhoneDisplay(settings.contactPhone),
        href: `tel:+${resolveBrazilWhatsAppNumber([settings.contactPhone]) || phoneDigits}`,
        kind: 'phone',
      })
    }

    const email = settings.contactEmail.trim()
    if (email) {
      links.push({
        id: 'email',
        title: 'Email',
        value: email,
        href: `mailto:${email}`,
        kind: 'email',
      })
    }

    const website = normalizeExternalUrl(settings.websiteUrl)
    if (website) {
      links.push({
        id: 'website',
        title: 'Site',
        value: settings.websiteUrl.trim(),
        href: website,
        kind: 'website',
      })
    }

    const socialCandidates: Array<{
      id: string
      title: string
      rawValue: string
      kind: ContactKind
    }> = [
      { id: 'instagram', title: 'Instagram', rawValue: settings.instagramUrl, kind: 'instagram' },
      { id: 'facebook', title: 'Facebook', rawValue: settings.facebookUrl, kind: 'facebook' },
      { id: 'linkedin', title: 'LinkedIn', rawValue: settings.linkedinUrl, kind: 'linkedin' },
      { id: 'youtube', title: 'YouTube', rawValue: settings.youtubeUrl, kind: 'youtube' },
    ]

    socialCandidates.forEach((candidate) => {
      const normalized = normalizeExternalUrl(candidate.rawValue)

      if (!normalized) {
        return
      }

      links.push({
        id: candidate.id,
        title: candidate.title,
        value: candidate.rawValue.trim(),
        href: normalized,
        kind: candidate.kind,
      })
    })

    const support = normalizeExternalUrl(settings.supportLink)
    if (support) {
      links.push({
        id: 'support',
        title: 'Atendimento',
        value: settings.supportLink.trim(),
        href: support,
        kind: 'support',
      })
    }

    return links
  }, [settings])

  const whatsappLink = useMemo(() => {
    const whatsapp = resolveBrazilWhatsAppNumber([
      settings.whatsappNumber,
      settings.contactPhone,
      import.meta.env.VITE_WHATSAPP_NUMBER,
    ])

    if (!whatsapp) {
      return null
    }

    return createDirectWhatsAppLink(whatsapp, buildDirectWhatsAppMessage())
  }, [settings.contactPhone, settings.whatsappNumber])

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.header
        className="mb-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Sobre a marca</p>
        <h1 className="mt-1 font-display text-4xl text-brand-text sm:text-5xl">Bianto Store</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-primary">
          A Bianto Store nasceu para transformar brindes em experiências premium. Trabalhamos com curadoria
          de produtos personalizados para campanhas de marca, presentes corporativos e datas especiais.
        </p>
      </motion.header>

      <motion.section
        className="grid gap-4 md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {[
          {
            title: 'Acabamento de alto nível',
            description: 'Selecionamos materiais com foco em durabilidade e apresentação elegante.',
            icon: Star,
          },
          {
            title: 'Personalização completa',
            description: 'Aplicamos logo, frase, cor e detalhes sob medida para cada pedido.',
            icon: Sparkles,
          },
          {
            title: 'Atendimento consultivo',
            description: 'Nossa equipe ajuda a montar kits ideais conforme público e orçamento.',
            icon: CheckCircle2,
          },
        ].map((item) => (
          <motion.article
            key={item.title}
            variants={{
              hidden: { opacity: 0, y: 22, scale: 0.97 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
            }}
            whileHover={{ y: -4, boxShadow: '0 10px 30px -8px rgba(43,43,43,0.15)' }}
            className="rounded-2xl border border-brand-surface bg-white p-6 shadow-sm"
          >
            <motion.span
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary"
              whileHover={{ scale: 1.12, rotate: 6 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <item.icon size={20} aria-hidden="true" />
            </motion.span>
            <h2 className="mt-4 font-display text-xl text-brand-text">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-primary">{item.description}</p>
          </motion.article>
        ))}
      </motion.section>

      <motion.section
        className="mt-10 rounded-2xl border border-brand-text/10 bg-white p-6 shadow-sm sm:p-8"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-3xl text-brand-text">Contato</h2>
            <p className="mt-2 text-sm text-brand-primary">
              Os canais abaixo são atualizados dinamicamente pelas configurações do Admin.
            </p>
          </div>

          {whatsappLink && (
            <Button
              variant="whatsapp"
              onClick={() => window.open(whatsappLink, '_blank', 'noopener,noreferrer')}
              aria-label="Falar com a Bianto Store no WhatsApp"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Falar no WhatsApp
            </Button>
          )}
        </div>

        <motion.div
          className="mt-6 grid gap-3 md:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {contactLinks.length === 0 && (
            <p className="rounded-xl border border-brand-surface bg-brand-bg px-4 py-3 text-sm text-brand-primary">
              Nenhum contato configurado no momento.
            </p>
          )}

          {contactLinks.map((contact) => (
            <motion.a
              key={contact.id}
              href={contact.href}
              target={/^https?:\/\//i.test(contact.href) ? '_blank' : undefined}
              rel={/^https?:\/\//i.test(contact.href) ? 'noopener noreferrer' : undefined}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
              }}
              whileHover={{ y: -3, boxShadow: '0 6px 20px -4px rgba(43,43,43,0.12)' }}
              className="group rounded-2xl border border-brand-surface bg-brand-bg p-4 transition-colors duration-200 hover:border-brand-primary/30"
            >
              <div className="flex items-start gap-3">
                <ContactLogo kind={contact.kind} size="sm" />
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-text">{contact.title}</span>
                  <p className="mt-1 line-clamp-2 text-sm text-brand-primary">{contact.value}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </motion.section>
    </div>
  )
}
