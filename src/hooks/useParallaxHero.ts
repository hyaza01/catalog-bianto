import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook de parallax para hero section.
 * Camada fundo: translateY a speedBg do scroll.
 * Camada texto: translateY a speedFg do scroll.
 * Desativado em mobile (<768px) e prefers-reduced-motion.
 */
export const useParallaxHero = (speedBg = 0.3, speedFg = 0.6) => {
  const sectionRef = useRef<HTMLElement>(null)
  const [bgY, setBgY] = useState(0)
  const [fgY, setFgY] = useState(0)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isMobile = window.innerWidth < 768
    setEnabled(!mql.matches && !isMobile)

    const handleChange = () => {
      const isNowMobile = window.innerWidth < 768
      setEnabled(!mql.matches && !isNowMobile)
    }

    mql.addEventListener('change', handleChange)
    window.addEventListener('resize', handleChange, { passive: true })
    return () => {
      mql.removeEventListener('change', handleChange)
      window.removeEventListener('resize', handleChange)
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (!enabled || !sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    const offset = -rect.top
    setBgY(offset * speedBg)
    setFgY(offset * speedFg)
  }, [enabled, speedBg, speedFg])

  useEffect(() => {
    if (!enabled) {
      setBgY(0)
      setFgY(0)
      return
    }
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(handleScroll)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    handleScroll() // initial
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [enabled, handleScroll])

  return { sectionRef, bgY, fgY, enabled }
}
