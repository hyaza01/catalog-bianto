import { Menu, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

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

  return (
    <header className="sticky top-0 z-40 border-b border-[#D8C8B8] bg-[#EDE6DE]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="group inline-flex items-center gap-2"
          aria-label="Ir para a pagina inicial da Bianto Store"
        >
          <span className="rounded-lg bg-[#2B2B2B] px-2 py-1 text-xs font-semibold tracking-[0.2em] text-white">BIANTO</span>
          <span className="font-display text-lg text-[#2B2B2B] transition-colors group-hover:text-[#5F6F5A]">Store</span>
        </NavLink>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Navegacao principal">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'relative px-0.5 py-2 text-sm font-medium transition-colors',
                  "after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[2px] after:bg-[#5F6F5A] after:transition-all after:duration-300 after:origin-left after:scale-x-0",
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F6F5A]',
                  isActive ? 'text-[#5F6F5A] after:scale-x-100' : 'text-[#2B2B2B] hover:text-[#5F6F5A] hover:after:scale-x-100',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenSelection}
            aria-label="Abrir selecao de produtos"
            className="hidden border border-[#A9B8A3] bg-[#D8C8B8] text-[#2B2B2B] hover:bg-[#CFC0B0] md:inline-flex"
          >
            <ShoppingBag size={16} aria-hidden="true" className="text-[#5F6F5A]" />
            Selecao ({selectionCount})
          </Button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D8C8B8] text-[#2B2B2B] transition hover:bg-[#D8C8B8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F6F5A] md:hidden"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-label="Abrir menu mobile"
          >
            <Menu size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-[#D8C8B8] bg-[#EDE6DE] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {navigationLinks.map((link) => (
              <NavLink
                key={link.to}
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
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
