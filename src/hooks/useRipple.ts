import { useCallback, type MouseEvent } from 'react'

/**
 * Hook que cria ripple effect em botões.
 * O botão deve ter position:relative e overflow:hidden.
 */
export const useRipple = () => {
  const createRipple = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const ripple = document.createElement('span')
    ripple.className = 'ripple-effect'
    ripple.style.width = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    button.appendChild(ripple)

    ripple.addEventListener('animationend', () => {
      ripple.remove()
    })
  }, [])

  return createRipple
}
