import { useEffect, useState } from 'react'

export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [direction, setDirection] = useState<'up' | 'down'>('down')

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          const currentProgress = docHeight > 0 ? currentScrollY / docHeight : 0

          setScrollY(currentScrollY)
          setProgress(Math.min(1, Math.max(0, currentProgress)))
          setDirection(currentScrollY > lastScrollY ? 'down' : 'up')

          lastScrollY = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { progress, scrollY, direction }
}
