import { useCallback, useRef, useState } from 'react'

// Cache implementation for expensive operations
class Cache<K, V> {
  private cache = new Map<K, V>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Move to end (LRU)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Global cache instances
export const workoutCache = new Cache<string, any>(50)
export const userDataCache = new Cache<string, any>(20)
export const imageCache = new Cache<string, string>(100)

// Debounce hook for expensive operations
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => callback(...args), delay)
    }) as T,
    [callback, delay]
  )
}

// Throttle hook for frequent events
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const lastRun = useRef<number>(0)

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastRun.current >= limit) {
        callback(...args)
        lastRun.current = now
      }
    }) as T,
    [callback, limit]
  )
}

// Memoization utility with expiration
export function memoizeWithExpiration<T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): T {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)
    const cached = cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value
    }
    
    const result = fn(...args)
    cache.set(key, { value: result, timestamp: Date.now() })
    
    return result
  }) as T
}

// Image preloader for better UX
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => 
      new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          imageCache.set(url, url)
          resolve()
        }
        img.onerror = reject
        img.src = url
      })
    )
  )
}

// Virtual scrolling hook for large lists
export function useVirtualScrolling({
  itemHeight,
  containerHeight,
  totalItems,
  overscan = 5
}: {
  itemHeight: number
  containerHeight: number
  totalItems: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = endIndex - startIndex + 1
  const totalHeight = totalItems * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    startIndex,
    endIndex,
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private marks = new Map<string, number>()
  private measures = new Map<string, number[]>()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  measure(name: string, startMark: string): number {
    const startTime = this.marks.get(startMark)
    if (!startTime) {
      console.warn(`Start mark '${startMark}' not found`)
      return 0
    }

    const duration = performance.now() - startTime
    
    if (!this.measures.has(name)) {
      this.measures.set(name, [])
    }
    this.measures.get(name)!.push(duration)

    return duration
  }

  getAverageTime(name: string): number {
    const measurements = this.measures.get(name)
    if (!measurements || measurements.length === 0) {
      return 0
    }
    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length
  }

  getStats(name: string): { avg: number; min: number; max: number; count: number } {
    const measurements = this.measures.get(name) || []
    if (measurements.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 }
    }

    return {
      avg: measurements.reduce((sum, time) => sum + time, 0) / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length
    }
  }

  clear(): void {
    this.marks.clear()
    this.measures.clear()
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance()

  const startMeasure = useCallback((name: string) => {
    monitor.mark(`${name}-start`)
  }, [])

  const endMeasure = useCallback((name: string) => {
    return monitor.measure(name, `${name}-start`)
  }, [])

  return { startMeasure, endMeasure, getStats: monitor.getStats.bind(monitor) }
}

// Bundle analyzer helper (development only)
export function analyzeBundleSize() {
  if (import.meta.env.DEV) {
    // Log component sizes and dependencies
    console.group('Bundle Analysis')
    console.log('Cache sizes:', {
      workout: workoutCache.size(),
      userData: userDataCache.size(),
      images: imageCache.size()
    })
    console.groupEnd()
  }
}