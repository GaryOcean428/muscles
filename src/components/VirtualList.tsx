import React, { useRef, useEffect, useState, useCallback, memo } from 'react'
import { useVirtualScrolling } from '@/utils/performance'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
  onScroll?: (scrollTop: number) => void
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const {
    startIndex,
    endIndex,
    totalHeight,
    offsetY
  } = useVirtualScrolling({
    itemHeight,
    containerHeight,
    totalItems: items.length,
    overscan
  })

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    onScroll?.(newScrollTop)
  }, [onScroll])

  const visibleItems = items.slice(startIndex, endIndex + 1)

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="virtual-list-item"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(VirtualList) as typeof VirtualList

// Example usage component for workout history
interface WorkoutHistoryItem {
  id: string
  name: string
  date: string
  duration: number
  calories: number
}

export const WorkoutHistoryList = memo(({ workouts }: { workouts: WorkoutHistoryItem[] }) => {
  const renderWorkoutItem = useCallback((workout: WorkoutHistoryItem, index: number) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
      <div>
        <h4 className="font-medium text-gray-900">{workout.name}</h4>
        <p className="text-sm text-gray-600">{workout.date}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{workout.duration} min</p>
        <p className="text-xs text-gray-600">{workout.calories} cal</p>
      </div>
    </div>
  ), [])

  return (
    <VirtualList
      items={workouts}
      itemHeight={80}
      containerHeight={400}
      renderItem={renderWorkoutItem}
      className="border rounded-lg"
    />
  )
})