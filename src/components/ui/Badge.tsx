import type { PropsWithChildren } from 'react'
import { cn } from '../../utils/cn'

type BadgeVariant = 'category' | 'featured' | 'unavailable' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
}

const variantMap: Record<BadgeVariant, string> = {
  default: 'bg-brand-surface/60 text-brand-text',
  category: 'bg-brand-primary/10 text-brand-primary',
  featured: 'bg-brand-accent/20 text-brand-accent',
  unavailable: 'bg-brand-primary/15 text-brand-primary',
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
