import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

interface FadeInSectionProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FadeInSection({ children, delay = 0, className }: FadeInSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={{
        hidden: { opacity: 0, y: shouldReduce ? 0 : 32 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}
