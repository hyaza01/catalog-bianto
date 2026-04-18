import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Ripple {
  x: number
  y: number
  id: number
}

export function useMotionRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const addRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples((prev) => [...prev, { x: e.clientX - r.left, y: e.clientY - r.top, id }])
    setTimeout(() => setRipples((prev) => prev.filter((rip) => rip.id !== id)), 600)
  }, [])

  const Ripples = useCallback(
    () => (
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              left: r.x - 30,
              top: r.y - 30,
              width: 60,
              height: 60,
              background: 'rgba(255,255,255,0.35)',
              pointerEvents: 'none',
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    ),
    [ripples],
  )

  return { addRipple, Ripples }
}
