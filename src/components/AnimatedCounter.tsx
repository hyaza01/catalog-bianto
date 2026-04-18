import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  className?: string
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  const shouldReduce = useReducedMotion()

  useEffect(() => {
    if (shouldReduce) {
      setDisplay(value)
      prev.current = value
      return
    }

    const from = prev.current
    const to = value
    const duration = 600
    const start = Date.now()

    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      if (progress < 1) requestAnimationFrame(tick)
      else prev.current = to
    }
    requestAnimationFrame(tick)
  }, [value, shouldReduce])

  return <span className={className}>{display}</span>
}
