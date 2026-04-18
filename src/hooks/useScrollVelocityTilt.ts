import { useScroll, useVelocity, useTransform, useSpring, useReducedMotion } from 'framer-motion'

export function useScrollVelocityTilt(_factor = 0.05) {
  const shouldReduce = useReducedMotion()
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const skewXRaw = useTransform(velocity, [-2000, 2000], shouldReduce ? [0, 0] : [-6, 6])
  const smoothSkew = useSpring(skewXRaw, { stiffness: 300, damping: 40 })
  return smoothSkew
}
