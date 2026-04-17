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
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson',
        active
          ? 'border-crimson bg-crimson/10 text-crimson'
          : 'border-slate-200 bg-white text-slate-600 hover:border-navy/40 hover:text-navy',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
