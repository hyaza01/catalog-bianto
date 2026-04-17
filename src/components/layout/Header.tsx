import { Menu, ShoppingBag, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

interface HeaderProps {
  onOpenSelection: () => void
  selectionCount: number
}

const navigationLinks = [
  { to: '/', label: 'Home' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/sobre', label: 'Sobre' },
]

export const Header = ({ onOpenSelection, selectionCount }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMobileMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-brand-surface bg-brand-bg/95 backdrop-blur-md" ref={mobileMenuRef}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="group inline-flex items-center gap-2.5"
          aria-label="Ir para a página inicial da Bianto Store"
        >
          <span className="rounded-lg bg-brand-text px-2.5 py-1 text-xs font-bold tracking-[0.2em] text-white transition-colors group-hover:bg-brand-primary">BIANTO</span>
          <span className="font-display text-lg text-brand-text transition-colors group-hover:text-brand-primary">Store</span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary',
                  isActive
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-brand-text hover:bg-brand-surface/60 hover:text-brand-primary',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenSelection}
            aria-label="Abrir seleção de produtos"
            className="hidden border border-brand-muted bg-brand-surface text-brand-text hover:bg-brand-surface/80 hover:border-brand-primary/30 md:inline-flex"
          >
            <ShoppingBag size={16} aria-hidden="true" className="text-brand-primary" />
            Seleção ({selectionCount})
          </Button>

          <button
            type="button"
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-lg border text-brand-text transition-all duration-200 md:hidden',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary',
              isMobileMenuOpen
                ? 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary'
                : 'border-brand-surface hover:bg-brand-surface',
            )}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'grid overflow-hidden border-t border-brand-surface bg-brand-bg transition-all duration-300 ease-in-out md:hidden',
          isMobileMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 border-t-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1.5 px-4 py-3">
            {navigationLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                      : 'text-brand-text hover:bg-brand-surface/60 hover:text-brand-primary',
                  )
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={() => {
                onOpenSelection()
                setIsMobileMenuOpen(false)
              }}
              className="mt-1 flex items-center gap-2.5 rounded-xl border border-brand-muted bg-brand-surface px-4 py-2.5 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-surface/80"
            >
              <ShoppingBag size={16} className="text-brand-primary" aria-hidden="true" />
              Minha Seleção ({selectionCount})
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
