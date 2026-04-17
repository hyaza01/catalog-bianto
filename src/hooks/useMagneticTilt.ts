import { useRef, useState, type MouseEvent } from 'react'

interface TiltState {
  rotateX: number
  rotateY: number
  scale: number
}

interface UseMagneticTiltOptions {
  maxTilt?: number
  scale?: number
  perspective?: number
}

export const useMagneticTilt = (options: UseMagneticTiltOptions = {}) => {
  const { maxTilt = 8, scale = 1.02, perspective = 800 } = options
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState<TiltState>({ rotateX: 0, rotateY: 0, scale: 1 })

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateX = (0.5 - y) * maxTilt
    const rotateY = (x - 0.5) * maxTilt
    setTilt({ rotateX, rotateY, scale })
  }

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 })
  }

  const style = {
    transform: `perspective(${perspective}px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(${tilt.scale}, ${tilt.scale}, ${tilt.scale})`,
    transition: tilt.rotateX === 0 && tilt.rotateY === 0 ? 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' : 'transform 0.1s ease-out',
  }

  return { ref, style, handleMouseMove, handleMouseLeave }
}
