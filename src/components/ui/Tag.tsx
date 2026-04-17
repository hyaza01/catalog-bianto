import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../utils/cn'

interface TagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export const Tag = ({ children, active = false, className, ...props }: PropsWithChildren<TagProps>) => {
  return (
    <button
      type="button"
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary',
        active
          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
          : 'border-brand-surface bg-white text-brand-text/70 hover:border-brand-primary/40 hover:text-brand-text',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
