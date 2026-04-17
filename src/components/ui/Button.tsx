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
    'bg-brand-primary text-white hover:bg-brand-primary2 active:scale-[0.98] focus-visible:outline-brand-primary disabled:bg-brand-primary/40 disabled:text-white/80',
  secondary:
    'bg-brand-text text-white hover:bg-brand-primary active:scale-[0.98] focus-visible:outline-brand-text disabled:bg-brand-text/40 disabled:text-white/80',
  outline:
    'border border-brand-text/20 bg-white text-brand-text hover:border-brand-primary hover:text-brand-primary active:scale-[0.98] focus-visible:outline-brand-primary disabled:border-brand-surface disabled:text-brand-muted',
  whatsapp:
    'bg-[#25D366] text-white hover:bg-[#1db855] active:scale-[0.98] focus-visible:outline-[#25D366] disabled:bg-[#25D366]/50 disabled:text-white/80',
}

const sizeClassMap: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
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
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold shadow-sm transition-all duration-200',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        sizeClassMap[size],
        variantClassMap[variant],
        fullWidth && 'w-full',
        props.disabled && 'cursor-not-allowed shadow-none',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
