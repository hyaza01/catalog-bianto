import { motion } from 'framer-motion'
import { textRevealContainer, textRevealChar, EASE_OUT_EXPO } from '../../utils/animations'

interface AnimatedTextProps {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  delay?: number
  once?: boolean
}

export const AnimatedText = ({
  text,
  className = '',
  as: Tag = 'h2',
  delay = 0,
  once = true,
}: AnimatedTextProps) => {
  const MotionTag = motion.create(Tag)
  const words = text.split(' ')

  return (
    <MotionTag
      className={className}
      variants={textRevealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.3 }}
      transition={{ delayChildren: delay }}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block overflow-hidden">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={`${wordIndex}-${charIndex}`}
              className="inline-block"
              variants={textRevealChar}
            >
              {char}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </MotionTag>
  )
}

interface RevealProps {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  once?: boolean
  amount?: number
}

export const Reveal = ({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.7,
  once = true,
  amount = 0.2,
}: RevealProps) => {
  const directionMap = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { x: 60, y: 0 },
    right: { x: -60, y: 0 },
  }

  const offset = directionMap[direction]

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...offset,
        filter: 'blur(8px)',
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: 'blur(0px)',
      }}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [...EASE_OUT_EXPO],
      }}
    >
      {children}
    </motion.div>
  )
}

interface ParallaxProps {
  children: React.ReactNode
  className?: string
  speed?: number
  offset?: number
}

export const Parallax = ({
  children,
  className = '',
  speed = 0.3,
  offset = 50,
}: ParallaxProps) => {
  return (
    <motion.div
      className={className}
      initial={{ y: offset }}
      whileInView={{ y: -offset * speed }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{
        duration: 0.8,
        ease: [...EASE_OUT_EXPO],
      }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerChildrenProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  once?: boolean
}

export const StaggerChildren = ({
  children,
  className = '',
  staggerDelay = 0.08,
  once = true,
}: StaggerChildrenProps) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export const StaggerItem = ({ children, className = '' }: StaggerItemProps) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          y: 30,
          scale: 0.95,
          filter: 'blur(6px)',
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: {
            duration: 0.6,
            ease: [...EASE_OUT_EXPO],
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  strength?: number
}

export const MagneticButton = ({
  children,
  className = '',
  strength = 0.3,
}: MagneticButtonProps) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) * strength
        const y = (e.clientY - rect.top - rect.height / 2) * strength
        ;(e.currentTarget as HTMLElement).style.transform = `translate(${x}px, ${y}px) scale(1.05)`
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.transform = ''
      }}
    >
      {children}
    </motion.div>
  )
}
