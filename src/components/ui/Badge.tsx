import type { PropsWithChildren } from 'react'
import { cn } from '../../utils/cn'

type BadgeVariant = 'category' | 'featured' | 'unavailable' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
}

const variantMap: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  category: 'bg-navy/10 text-navy',
  featured: 'bg-amber/20 text-amber-700',
  unavailable: 'bg-crimson/15 text-crimson',
}

export const Badge = ({ children, variant = 'default', className }: PropsWithChildren<BadgeProps>) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        variantMap[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
