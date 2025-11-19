import { useRef, useCallback, useEffect } from 'react'

/**
 * Custom hook for managing multiple timeouts with automatic cleanup
 * Provides a clean API for scheduling and clearing timeouts
 */
export function useTimeoutManager() {
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = []
  }, [])

  const schedule = useCallback((callback: () => void, delay: number): void => {
    const timeout = setTimeout(() => {
      callback()
      // Remove from array after execution
      timeoutsRef.current = timeoutsRef.current.filter(t => t !== timeout)
    }, delay)
    timeoutsRef.current.push(timeout)
  }, [])

  const scheduleAsync = useCallback((callback: () => void | Promise<void>, delay: number): Promise<void> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(async () => {
        await callback()
        timeoutsRef.current = timeoutsRef.current.filter(t => t !== timeout)
        resolve()
      }, delay)
      timeoutsRef.current.push(timeout)
    })
  }, [])

  const delay = useCallback((ms: number): Promise<void> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        timeoutsRef.current = timeoutsRef.current.filter(t => t !== timeout)
        resolve()
      }, ms)
      timeoutsRef.current.push(timeout)
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAll()
  }, [clearAll])

  return {
    schedule,
    scheduleAsync,
    delay,
    clearAll,
  }
}

