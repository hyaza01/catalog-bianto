import { motion, useSpring, useReducedMotion } from 'framer-motion'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
}

export function MagneticButton({ children, className }: MagneticButtonProps) {
  const shouldReduce = useReducedMotion()
  const x = useSpring(0, { stiffness: 200, damping: 20 })
  const y = useSpring(0, { stiffness: 200, damping: 20 })

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (shouldReduce) return
    const r = e.currentTarget.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    x.set((e.clientX - cx) * 0.35)
    y.set((e.clientY - cy) * 0.35)
  }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      style={{ x, y, display: 'inline-block' }}
    >
      <div className={className}>{children}</div>
    </motion.div>
  )
}
