import { X } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface CloseButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  tone?: 'surface' | 'overlay'
  size?: 'md' | 'lg'
}

const sizeClasses = {
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-11 w-11 rounded-2xl',
} as const

const iconSizes = {
  md: 16,
  lg: 18,
} as const

const toneClasses = {
  surface:
    'border border-[#D9D0C6] bg-[#F7F1EA]/95 text-[#5F6F5A] shadow-[0_10px_28px_rgba(43,43,43,0.08)] backdrop-blur-sm hover:-translate-y-0.5 hover:border-[#C9A46A]/55 hover:bg-white hover:text-[#2B2B2B] focus-visible:outline-[#C9A46A]',
  overlay:
    'border border-white/20 bg-white/10 text-white shadow-[0_12px_30px_rgba(0,0,0,0.3)] backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-white',
} as const

export const CloseButton = ({
  tone = 'surface',
  size = 'md',
  className,
  type = 'button',
  ...props
}: CloseButtonProps) => {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        'group inline-flex items-center justify-center transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        sizeClasses[size],
        toneClasses[tone],
        className,
      )}
    >
      <X
        size={iconSizes[size]}
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:rotate-90"
      />
    </button>
  )
}