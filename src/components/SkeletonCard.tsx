import { motion, useReducedMotion } from 'framer-motion'

export function SkeletonCard() {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      className="rounded-2xl overflow-hidden bg-stone-100"
      animate={shouldReduce ? undefined : { opacity: [0.5, 0.9, 0.5] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="aspect-square bg-stone-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-stone-200 rounded-full w-1/3" />
        <div className="h-4 bg-stone-200 rounded-full w-4/5" />
        <div className="h-4 bg-stone-200 rounded-full w-3/5" />
        <div className="h-10 bg-stone-200 rounded-xl mt-4" />
      </div>
    </motion.div>
  )
}
