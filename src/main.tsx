import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { queryClient } from './api/queryClient'
import './index.css'
import App from './App.tsx'

const cacheCleanupVersionKey = 'bianto-cache-cleanup-v1'

const cleanupLegacyServiceWorkers = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  try {
    const alreadyCleaned = window.localStorage.getItem(cacheCleanupVersionKey) === 'done'

    if (alreadyCleaned) {
      return
    }

    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))

    if ('caches' in window) {
      const cacheKeys = await caches.keys()
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)))
    }

    window.localStorage.setItem(cacheCleanupVersionKey, 'done')
  } catch {
    // noop
  }
}

void cleanupLegacyServiceWorkers()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
