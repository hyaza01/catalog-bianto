import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

interface AnimatedTitleProps {
  text: string
  className?: string
  delay?: number
}

export function AnimatedTitle({ text, className, delay = 0 }: AnimatedTitleProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const shouldReduce = useReducedMotion()
  const words = text.split(' ')

  if (shouldReduce) {
    return <span className={className}>{text}</span>
  }

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25em' }}
    >
      {words.map((word, i) => (
        <span key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            variants={{
              hidden: { y: '110%', rotate: 3 },
              show: {
                y: '0%',
                rotate: 0,
                transition: {
                  duration: 0.65,
                  delay: delay + i * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
