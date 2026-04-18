import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Header } from './Header'
import { Footer } from './Footer'
import { FloatingSelectionButton } from '../selection/FloatingSelectionButton'
import { SelectionDrawer } from '../selection/SelectionDrawer'
import { useSelection } from '../../hooks/useSelection'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { siteSettingsQueryKey } from '../../hooks/useSiteSettings'
import { productsQueryKey } from '../../hooks/useProducts'
import { publicCategoriesQueryKey } from '../../hooks/usePublicCategories'
import { PageTransition } from '../PageTransition'

export const Layout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const queryClient = useQueryClient()
  const location = useLocation()
  const { totalQuantity } = useSelection()
  const { barRef } = useScrollProgress()
  const isCatalogRoute = location.pathname.startsWith('/catalogo')
  const hasMobileFab = !isCatalogRoute
  const openSelectionDrawer = () => setIsDrawerOpen(true)

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: siteSettingsQueryKey, refetchType: 'active' })
    void queryClient.invalidateQueries({ queryKey: productsQueryKey, refetchType: 'active' })
    void queryClient.invalidateQueries({ queryKey: publicCategoriesQueryKey, refetchType: 'active' })
  }, [location.key, queryClient])

  return (
    <div className="min-h-screen bg-paper text-navy">
      {/* Scroll progress bar */}
      <div
        ref={barRef}
        className="scroll-progress-bar"
        aria-hidden="true"
      />



      {/* Background decorations with CSS animation (GPU-friendly) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-crimson/10 blur-3xl bg-orb-1" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-amber/20 blur-3xl bg-orb-2" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-navy/10 blur-3xl bg-orb-3" />
      </div>

      <Header onOpenSelection={openSelectionDrawer} selectionCount={totalQuantity} />

      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <main className={hasMobileFab ? 'pb-24 md:pb-0' : undefined}>
            <Outlet context={{ openSelectionDrawer }} />
          </main>
        </PageTransition>
      </AnimatePresence>

      <Footer />

      <FloatingSelectionButton
        count={totalQuantity}
        onClick={openSelectionDrawer}
        mobileVisible={!isCatalogRoute}
        desktopVisible={isCatalogRoute}
      />
      <SelectionDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  )
}
