import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { EASE_OUT_EXPO } from '../utils/animations'

export const NotFoundPage = () => {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating decorative 404 numbers */}
      {[...Array(5)].map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute font-display text-[8rem] font-bold text-navy/[0.03] select-none"
          style={{
            left: `${15 + i * 18}%`,
            top: `${10 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, i % 2 === 0 ? 8 : -8, 0],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        >
          {i % 2 === 0 ? '4' : '0'}
        </motion.span>
      ))}

      <motion.p
        className="text-sm uppercase tracking-[0.18em] text-slate-500 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [...EASE_OUT_EXPO] }}
      >
        Erro 404
      </motion.p>
      <motion.h1
        className="mt-2 font-display text-5xl text-navy relative z-10"
        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, delay: 0.15, ease: [...EASE_OUT_EXPO] }}
      >
        Pagina nao encontrada
      </motion.h1>
      <motion.p
        className="mt-3 max-w-xl text-sm text-slate-600 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        O conteudo que voce tentou acessar nao existe ou foi movido.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="relative z-10"
      >
        <Link
          to="/"
          aria-label="Voltar para home"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-crimson px-5 text-sm font-semibold text-white transition hover:bg-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
        >
          Voltar para Home
        </Link>
      </motion.div>
    </div>
  )
}
