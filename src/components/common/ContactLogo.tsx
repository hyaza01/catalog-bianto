import type { ComponentType } from 'react'
import { Globe, Link2, Mail, MessageCircle, Phone } from 'lucide-react'
import { cn } from '../../utils/cn'

export type ContactKind =
  | 'whatsapp'
  | 'phone'
  | 'email'
  | 'website'
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'youtube'
  | 'support'

type ContactLogoSize = 'sm' | 'md'

interface ContactLogoProps {
  kind: ContactKind
  size?: ContactLogoSize
}

type IconComponent = ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>

type ContactLogoMeta = {
  badge: string
  Icon: IconComponent
  containerClassName: string
  iconClassName: string
  glowClassName: string
  badgeClassName: string
}

const sizeClassMap: Record<ContactLogoSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
}

const logoMetaMap: Record<ContactKind, ContactLogoMeta> = {
  whatsapp: {
    badge: 'WA',
    Icon: MessageCircle,
    containerClassName: 'border-emerald-300/70 bg-gradient-to-br from-emerald-200 via-emerald-300 to-emerald-500',
    iconClassName: 'text-emerald-950',
    glowClassName: 'bg-emerald-400',
    badgeClassName: 'border-emerald-300 bg-emerald-900 text-emerald-50',
  },
  phone: {
    badge: 'TEL',
    Icon: Phone,
    containerClassName: 'border-sky-300/70 bg-gradient-to-br from-sky-100 via-sky-200 to-sky-400',
    iconClassName: 'text-sky-950',
    glowClassName: 'bg-sky-300',
    badgeClassName: 'border-sky-300 bg-sky-900 text-sky-50',
  },
  email: {
    badge: 'E',
    Icon: Mail,
    containerClassName: 'border-violet-300/70 bg-gradient-to-br from-violet-100 via-violet-200 to-violet-400',
    iconClassName: 'text-violet-950',
    glowClassName: 'bg-violet-300',
    badgeClassName: 'border-violet-300 bg-violet-900 text-violet-50',
  },
  website: {
    badge: 'WEB',
    Icon: Globe,
    containerClassName: 'border-cyan-300/70 bg-gradient-to-br from-cyan-100 via-cyan-200 to-cyan-400',
    iconClassName: 'text-cyan-950',
    glowClassName: 'bg-cyan-300',
    badgeClassName: 'border-cyan-300 bg-cyan-900 text-cyan-50',
  },
  instagram: {
    badge: 'IG',
    Icon: Link2,
    containerClassName: 'border-pink-300/70 bg-gradient-to-br from-pink-100 via-fuchsia-200 to-orange-300',
    iconClassName: 'text-pink-950',
    glowClassName: 'bg-fuchsia-300',
    badgeClassName: 'border-pink-300 bg-pink-900 text-pink-50',
  },
  facebook: {
    badge: 'FB',
    Icon: Link2,
    containerClassName: 'border-blue-300/70 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400',
    iconClassName: 'text-blue-950',
    glowClassName: 'bg-blue-300',
    badgeClassName: 'border-blue-300 bg-blue-900 text-blue-50',
  },
  linkedin: {
    badge: 'IN',
    Icon: Link2,
    containerClassName: 'border-slate-300/70 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-400',
    iconClassName: 'text-slate-950',
    glowClassName: 'bg-slate-300',
    badgeClassName: 'border-slate-300 bg-slate-900 text-slate-50',
  },
  youtube: {
    badge: 'YT',
    Icon: Link2,
    containerClassName: 'border-rose-300/70 bg-gradient-to-br from-rose-100 via-rose-200 to-red-400',
    iconClassName: 'text-rose-950',
    glowClassName: 'bg-rose-300',
    badgeClassName: 'border-rose-300 bg-rose-900 text-rose-50',
  },
  support: {
    badge: 'SUP',
    Icon: Globe,
    containerClassName: 'border-amber-300/70 bg-gradient-to-br from-amber-100 via-amber-200 to-amber-400',
    iconClassName: 'text-amber-950',
    glowClassName: 'bg-amber-300',
    badgeClassName: 'border-amber-300 bg-amber-900 text-amber-50',
  },
}

export const ContactLogo = ({ kind, size = 'md' }: ContactLogoProps) => {
  const logoMeta = logoMetaMap[kind]
  const Icon = logoMeta.Icon
  const iconSize = size === 'sm' ? 15 : 17

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-xl border shadow-sm',
        sizeClassMap[size],
        logoMeta.containerClassName,
      )}
      aria-hidden="true"
    >
      <span className={cn('pointer-events-none absolute inset-0 rounded-xl opacity-35 blur-[8px]', logoMeta.glowClassName)} />
      <Icon size={iconSize} className={cn('relative z-10', logoMeta.iconClassName)} aria-hidden={true} />
      <span
        className={cn(
          'absolute -bottom-1 -right-1 rounded-md border px-1 py-0 text-[9px] font-bold leading-none tracking-wide shadow-sm',
          logoMeta.badgeClassName,
        )}
      >
        {logoMeta.badge}
      </span>
    </span>
  )
}