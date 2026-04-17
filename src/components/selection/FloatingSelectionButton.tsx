import { ShoppingBag } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/cn'

interface FloatingSelectionButtonProps {
  count: number
  onClick: () => void
  desktopVisible?: boolean
  mobileVisible?: boolean
}

export const FloatingSelectionButton = ({
  count,
  onClick,
  desktopVisible = false,
  mobileVisible = true,
}: FloatingSelectionButtonProps) => {
  const previousCount = useRef(count)
  const [isBumping, setIsBumping] = useState(false)

  useEffect(() => {
    if (count > previousCount.current) {
      setIsBumping(true)
      const timer = window.setTimeout(() => {
        setIsBumping(false)
      }, 650)

      previousCount.current = count

      return () => {
        window.clearTimeout(timer)
      }
    }

    previousCount.current = count
    return undefined
  }, [count])

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir painel de seleção"
      className={cn(
        'fixed bottom-4 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-brand-primary2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary md:bottom-6 md:right-6 md:h-14 md:w-14',
        mobileVisible ? 'inline-flex' : 'hidden',
        desktopVisible ? 'md:inline-flex' : 'md:hidden',
        isBumping && 'animate-[bounce_650ms_ease-out]',
      )}
    >
      <ShoppingBag size={20} aria-hidden="true" />
      <span
        className={cn(
          'absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1 font-mono text-[11px] font-bold text-brand-text transition-transform duration-300',
          isBumping ? 'scale-110' : 'scale-100',
        )}
      >
        {count}
      </span>
      {isBumping && (
        <span
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-accent/80 animate-[ping_650ms_ease-out]"
          aria-hidden="true"
        />
      )}
    </button>
  )
}
