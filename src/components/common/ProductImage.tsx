import type { ImgHTMLAttributes, SyntheticEvent } from 'react'
import { useState } from 'react'
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/constants'
import { cn } from '../../utils/cn'

interface ProductImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
  imgClassName?: string
}
export const ProductImage = ({ src, onError, onLoad, className, imgClassName, style, ...props }: ProductImageProps) => {
  const normalizedSrc = typeof src === 'string' ? src.trim() : ''
  const preferredSrc = normalizedSrc.length > 0 ? normalizedSrc : DEFAULT_PRODUCT_IMAGE

  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const finalSrc = failedSrc === preferredSrc ? DEFAULT_PRODUCT_IMAGE : preferredSrc

  const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    if (onLoad) {
      onLoad(event)
    }
  }

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    setFailedSrc(preferredSrc)

    if (onError) {
      onError(event)
    }
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={style}>
      <img
        {...props}
        src={finalSrc}
        className={cn('h-full w-full object-contain', imgClassName)}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}
