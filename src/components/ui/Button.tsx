import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'whatsapp'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    'bg-crimson text-white hover:bg-sage focus-visible:outline-crimson disabled:bg-crimson/40 disabled:text-white/80',
  secondary:
    'bg-navy text-white hover:bg-crimson focus-visible:outline-navy disabled:bg-navy/40 disabled:text-white/80',
  outline:
    'border border-navy/20 bg-white text-navy hover:border-crimson hover:text-crimson focus-visible:outline-crimson disabled:border-slate-200 disabled:text-slate-400',
  whatsapp:
    'bg-[#25D366] text-white hover:bg-[#1db855] focus-visible:outline-[#25D366] disabled:bg-[#25D366]/50 disabled:text-white/80',
}

const sizeClassMap: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}: PropsWithChildren<ButtonProps>) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        sizeClassMap[size],
        variantClassMap[variant],
        fullWidth && 'w-full',
        props.disabled && 'cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
