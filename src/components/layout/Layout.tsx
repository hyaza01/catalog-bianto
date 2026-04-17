import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { FloatingSelectionButton } from '../selection/FloatingSelectionButton'
import { SelectionDrawer } from '../selection/SelectionDrawer'
import { useSelection } from '../../hooks/useSelection'
import { siteSettingsQueryKey } from '../../hooks/useSiteSettings'
import { productsQueryKey } from '../../hooks/useProducts'
import { publicCategoriesQueryKey } from '../../hooks/usePublicCategories'

export const Layout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const queryClient = useQueryClient()
  const location = useLocation()
  const { totalQuantity } = useSelection()
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
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-28 top-16 h-80 w-80 rounded-full bg-brand-primary/8 blur-[100px]" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-brand-accent/12 blur-[100px]" />
        <div className="absolute -bottom-16 left-1/4 h-72 w-72 rounded-full bg-brand-primary/6 blur-[80px]" />
      </div>

      <Header onOpenSelection={openSelectionDrawer} selectionCount={totalQuantity} />

      <main className={hasMobileFab ? 'pb-24 md:pb-0' : undefined}>
        <Outlet context={{ openSelectionDrawer }} />
      </main>

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
