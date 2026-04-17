import { useEffect, useState } from 'react'

interface UseImageColorResult {
  color: string | null
  isCalculating: boolean
}

const sampleEdgeColor = (imageElement: HTMLImageElement): string | null => {
  try {
    if (typeof window === 'undefined') {
      return null
    }

    const size = 64
    const margin = 8

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const context = canvas.getContext('2d', { willReadFrequently: true })

    if (!context) {
      return null
    }

    context.drawImage(imageElement, 0, 0, size, size)

    const pixels = context.getImageData(0, 0, size, size).data

    let weightedRed = 0
    let weightedGreen = 0
    let weightedBlue = 0
    let weightedAlpha = 0

    const samplePixel = (x: number, y: number) => {
      const offset = (y * size + x) * 4
      const alpha = pixels[offset + 3] / 255

      if (alpha <= 0.05) {
        return
      }

      weightedRed += pixels[offset] * alpha
      weightedGreen += pixels[offset + 1] * alpha
      weightedBlue += pixels[offset + 2] * alpha
      weightedAlpha += alpha
    }

    for (let y = 0; y < margin; y += 1) {
      for (let x = 0; x < size; x += 1) {
        samplePixel(x, y)
      }
    }

    for (let y = size - margin; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        samplePixel(x, y)
      }
    }

    for (let x = 0; x < margin; x += 1) {
      for (let y = margin; y < size - margin; y += 1) {
        samplePixel(x, y)
      }
    }

    for (let x = size - margin; x < size; x += 1) {
      for (let y = margin; y < size - margin; y += 1) {
        samplePixel(x, y)
      }
    }

    if (weightedAlpha <= 0) {
      return null
    }

    const red = Math.round(weightedRed / weightedAlpha)
    const green = Math.round(weightedGreen / weightedAlpha)
    const blue = Math.round(weightedBlue / weightedAlpha)

    return `rgb(${red}, ${green}, ${blue})`
  } catch {
    return null
  }
}

export const useImageColor = (url: string | null | undefined): UseImageColorResult => {
  const [color, setColor] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    const normalizedUrl = (url ?? '').trim()

    if (!normalizedUrl) {
      setColor(null)
      setIsCalculating(false)
      return
    }

    let isMounted = true

    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.decoding = 'async'

    setIsCalculating(true)

    image.onload = () => {
      if (!isMounted) {
        return
      }

      const extractedColor = sampleEdgeColor(image)
      setColor(extractedColor)
      setIsCalculating(false)
    }

    image.onerror = () => {
      if (!isMounted) {
        return
      }

      setColor(null)
      setIsCalculating(false)
    }

    try {
      image.src = normalizedUrl
    } catch {
      setColor(null)
      setIsCalculating(false)
    }

    return () => {
      isMounted = false
    }
  }, [url])

  return {
    color,
    isCalculating,
  }
}
