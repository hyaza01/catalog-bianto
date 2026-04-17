import { useCallback, useEffect, useRef } from 'react'

interface UseDebouncedCallbackResult<T extends unknown[]> {
  debounced: (...args: T) => void
  cancel: () => void
}

export const useDebouncedCallback = <T extends unknown[]>(
  callback: (...args: T) => void,
  delayMs = 400,
): UseDebouncedCallbackResult<T> => {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const cancel = useCallback(() => {
    if (timeoutRef.current === null) {
      return
    }

    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }, [])

  const debounced = useCallback(
    (...args: T) => {
      cancel()

      timeoutRef.current = window.setTimeout(() => {
        callbackRef.current(...args)
        timeoutRef.current = null
      }, delayMs)
    },
    [cancel, delayMs],
  )

  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  return {
    debounced,
    cancel,
  }
}
