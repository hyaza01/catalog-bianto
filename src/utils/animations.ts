import { type Variants } from 'framer-motion'

// Ease curves inspired by premium sites
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const
export const EASE_IN_OUT_CUBIC = [0.65, 0, 0.35, 1] as const

// Page transition
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    filter: 'blur(8px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [...EASE_OUT_EXPO],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: 'blur(6px)',
    transition: {
      duration: 0.35,
      ease: [...EASE_OUT_QUART],
    },
  },
}

// Stagger container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

// Fade up item
export const fadeUpItem: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [...EASE_OUT_EXPO],
    },
  },
}

// Fade in scale
export const fadeInScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [...EASE_OUT_EXPO],
    },
  },
}

// Slide in from left
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [...EASE_OUT_EXPO],
    },
  },
}

// Slide in from right
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [...EASE_OUT_EXPO],
    },
  },
}

// Text reveal character by character
export const textRevealContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.02,
    },
  },
}

export const textRevealChar: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    rotateX: -90,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.5,
      ease: [...EASE_OUT_EXPO],
    },
  },
}

// Parallax hero
export const parallaxSlow = {
  y: [0, -30],
  transition: { ease: 'linear' },
}

// Modal/overlay animations
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [...EASE_OUT_EXPO],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 10,
    transition: {
      duration: 0.2,
      ease: [...EASE_OUT_QUART],
    },
  },
}

// Drawer slide
export const drawerVariants: Variants = {
  hidden: {
    x: '100%',
    opacity: 0.5,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    x: '100%',
    opacity: 0.5,
    transition: {
      duration: 0.3,
      ease: [...EASE_OUT_QUART],
    },
  },
}

// Bottom sheet
export const bottomSheetVariants: Variants = {
  hidden: {
    y: '100%',
    opacity: 0.5,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 28,
      stiffness: 320,
    },
  },
  exit: {
    y: '100%',
    opacity: 0.5,
    transition: {
      duration: 0.3,
      ease: [...EASE_OUT_QUART],
    },
  },
}

// Floating button
export const floatingButtonVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 300,
      delay: 0.5,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    rotate: 180,
    transition: {
      duration: 0.3,
    },
  },
}

// Magnetic hover for links
export const magneticHover = {
  scale: 1.05,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },
}

// Section reveal
export const sectionReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [...EASE_OUT_EXPO],
    },
  },
}

// Counting number animation helper
export const counterSpring = {
  type: 'spring' as const,
  damping: 25,
  stiffness: 200,
}
