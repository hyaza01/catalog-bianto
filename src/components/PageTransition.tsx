import { motion } from 'framer-motion'

const variants = {
  initial: { clipPath: 'inset(0 100% 0 0)' },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] as const },
  },
  exit: {
    clipPath: 'inset(0 0 0 100%)',
    transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] as const },
  },
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ position: 'relative', width: '100%' }}
    >
      {children}
    </motion.div>
  )
}
