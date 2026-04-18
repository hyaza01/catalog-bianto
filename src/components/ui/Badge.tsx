import type { PropsWithChildren } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
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
  const shouldReduce = useReducedMotion()

  const baseClasses = cn(
    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
    variantMap[variant],
    className,
  )

  if (variant === 'featured' && !shouldReduce) {
    return (
      <motion.span
        className={baseClasses}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {children}
      </motion.span>
    )
  }

  return (
    <span className={baseClasses}>
      {children}
    </span>
  )
}
