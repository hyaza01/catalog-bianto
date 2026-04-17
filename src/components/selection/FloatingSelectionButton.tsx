import { ShoppingBag } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Abrir painel de seleção"
      className={cn(
        'fixed bottom-4 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-xl md:bottom-6 md:right-6 md:h-14 md:w-14',
        mobileVisible ? 'inline-flex' : 'hidden',
        desktopVisible ? 'md:inline-flex' : 'md:hidden',
      )}
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(95, 111, 90, 0.4)' }}
      whileTap={{ scale: 0.9 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 300,
        delay: 0.5,
      }}
    >
      <ShoppingBag size={20} aria-hidden="true" />
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1 font-mono text-[11px] font-bold text-brand-text"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          {count}
        </motion.span>
      </AnimatePresence>
      {isBumping && (
        <span
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-accent/80 animate-[ping_650ms_ease-out]"
          aria-hidden="true"
        />
      )}
    </motion.button>
  )
}
