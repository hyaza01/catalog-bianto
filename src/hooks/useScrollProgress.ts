import { useCallback, useEffect, useRef } from 'react'

/**
 * Scroll-progress hook que NÃO causa re-render.
 * Retorna refs estáveis cujos `.current` são atualizados via rAF.
 * Também aceita um `barRef` para atualizar a progress-bar direto no DOM.
 */
export const useScrollProgress = () => {
  const progressRef = useRef(0)
  const scrollYRef = useRef(0)
  const directionRef = useRef<'up' | 'down'>('down')
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          const currentProgress = docHeight > 0 ? currentScrollY / docHeight : 0

          scrollYRef.current = currentScrollY
          progressRef.current = Math.min(1, Math.max(0, currentProgress))
          directionRef.current = currentScrollY > lastScrollY ? 'down' : 'up'

          // Atualiza a progress-bar direto no DOM (zero re-renders)
          if (barRef.current) {
            barRef.current.style.transform = `scaleX(${progressRef.current})`
          }

          lastScrollY = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /** Lê os valores atuais sem causar re-render */
  const getValues = useCallback(() => ({
    progress: progressRef.current,
    scrollY: scrollYRef.current,
    direction: directionRef.current,
  }), [])

  return { progressRef, scrollYRef, directionRef, barRef, getValues }
}
