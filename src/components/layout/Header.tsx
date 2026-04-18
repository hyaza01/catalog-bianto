import { Menu, ShoppingBag, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'
import { EASE_OUT_EXPO } from '../../utils/animations'

interface HeaderProps {
  onOpenSelection: () => void
  selectionCount: number
}

const navigationLinks = [
  { to: '/', label: 'Home' },
  { to: '/catalogo', label: 'Catalogo' },
  { to: '/sobre', label: 'Sobre' },
]

export const Header = ({ onOpenSelection, selectionCount }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const lastYRef = useRef(0)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const dir = y > lastYRef.current ? 'down' : 'up'
        lastYRef.current = y

        const scrolled = y > 20
        const hidden = dir === 'down' && y > 300

        // Só chama setState se o valor realmente mudou
        setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev))
        setIsHidden((prev) => (prev !== hidden ? hidden : prev))

        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-500',
        isScrolled
          ? 'border-[#D8C8B8]/80 bg-[#EDE6DE]/85 shadow-lg shadow-navy/5 backdrop-blur-xl'
          : 'border-[#D8C8B8] bg-[#EDE6DE]/95 backdrop-blur',
      )}
      initial={{ y: -100 }}
      animate={{
        y: isHidden ? -100 : 0,
      }}
      transition={{
        duration: 0.4,
        ease: [...EASE_OUT_EXPO],
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="group inline-flex items-center gap-2"
          aria-label="Ir para a pagina inicial da Bianto Store"
        >
          <motion.span
            className="rounded-lg bg-[#2B2B2B] px-2 py-1 text-xs font-semibold tracking-[0.2em] text-white"
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            BIANTO
          </motion.span>
          <span className="font-display text-lg text-[#2B2B2B] transition-colors group-hover:text-[#5F6F5A]">Store</span>
        </NavLink>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Navegacao principal">
          {navigationLinks.map((link, index) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08, duration: 0.5, ease: [...EASE_OUT_EXPO] }}
            >
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'relative px-0.5 py-2 text-sm font-medium transition-colors',
                    "after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[2px] after:bg-[#5F6F5A] after:transition-all after:duration-500 after:origin-left after:scale-x-0",
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F6F5A]',
                    isActive ? 'text-[#5F6F5A] after:scale-x-100' : 'text-[#2B2B2B] hover:text-[#5F6F5A] hover:after:scale-x-100',
                  )
                }
              >
                {link.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenSelection}
              aria-label="Abrir selecao de produtos"
              className="hidden border border-[#A9B8A3] bg-[#D8C8B8] text-[#2B2B2B] hover:bg-[#CFC0B0] md:inline-flex"
            >
              <ShoppingBag size={16} aria-hidden="true" className="text-[#5F6F5A]" />
              Selecao
              <AnimatePresence mode="wait">
                <motion.span
                  key={selectionCount}
                  className="inline-block"
                  style={{ perspective: '200px' }}
                  initial={{ rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ({selectionCount})
                </motion.span>
              </AnimatePresence>
            </Button>
          </motion.div>

          <motion.button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D8C8B8] text-[#2B2B2B] transition hover:bg-[#D8C8B8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F6F5A] md:hidden"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-label="Abrir menu mobile"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={18} aria-hidden="true" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={18} aria-hidden="true" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="border-t border-[#D8C8B8] bg-[#EDE6DE] px-4 py-3 md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [...EASE_OUT_EXPO] }}
          >
            <div className="flex flex-col gap-2">
              {navigationLinks.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4, ease: [...EASE_OUT_EXPO] }}
                >
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        'rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'border-[#5F6F5A]/40 text-[#5F6F5A]'
                          : 'text-[#2B2B2B] hover:border-[#D8C8B8] hover:bg-[#D8C8B8] hover:text-[#5F6F5A]',
                      )
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
