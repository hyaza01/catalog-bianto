import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AdminGuard } from './components/admin/AdminGuard'
import { Layout } from './components/layout/Layout'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminPage } from './pages/AdminPage'
import { AboutPage } from './pages/AboutPage'
import { CatalogPage } from './pages/CatalogPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route
          path="admin"
          element={
            <AdminGuard>
              <AdminPage />
            </AdminGuard>
          }
        />

        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="sobre" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
