import React, { useRef, useCallback, useEffect } from 'react'

// Hook for managing focus trap within modals and dialogs
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ].join(', ')
    
    return Array.from(containerRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[]
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || e.key !== 'Tab') return
    
    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }, [isActive, getFocusableElements])

  useEffect(() => {
    if (isActive) {
      previousActiveElement.current = document.activeElement as HTMLElement
      
      // Focus first focusable element
      const focusableElements = getFocusableElements()
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
      
      document.addEventListener('keydown', handleKeyDown)
    } else {
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
      
      document.removeEventListener('keydown', handleKeyDown)
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, handleKeyDown, getFocusableElements])

  return containerRef
}

// Hook for keyboard navigation in lists and grids
export function useKeyboardNavigation({
  itemCount,
  onItemSelect,
  isGrid = false,
  columnsCount = 1
}: {
  itemCount: number
  onItemSelect: (index: number) => void
  isGrid?: boolean
  columnsCount?: number
}) {
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const containerRef = useRef<HTMLElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    let newIndex = activeIndex
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (isGrid) {
          newIndex = Math.min(itemCount - 1, activeIndex + columnsCount)
        } else {
          newIndex = Math.min(itemCount - 1, activeIndex + 1)
        }
        break
        
      case 'ArrowUp':
        e.preventDefault()
        if (isGrid) {
          newIndex = Math.max(0, activeIndex - columnsCount)
        } else {
          newIndex = Math.max(0, activeIndex - 1)
        }
        break
        
      case 'ArrowRight':
        if (isGrid) {
          e.preventDefault()
          newIndex = Math.min(itemCount - 1, activeIndex + 1)
        }
        break
        
      case 'ArrowLeft':
        if (isGrid) {
          e.preventDefault()
          newIndex = Math.max(0, activeIndex - 1)
        }
        break
        
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
        
      case 'End':
        e.preventDefault()
        newIndex = itemCount - 1
        break
        
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (activeIndex >= 0) {
          onItemSelect(activeIndex)
        }
        break
        
      default:
        return
    }
    
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex)
    }
  }, [activeIndex, itemCount, isGrid, columnsCount, onItemSelect])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
      return () => container.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return {
    activeIndex,
    setActiveIndex,
    containerRef,
    getItemProps: (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      'aria-selected': index === activeIndex,
      'data-active': index === activeIndex
    })
  }
}

// Hook for managing skip links
export function useSkipLinks() {
  const skipLinksRef = useRef<HTMLDivElement>(null)
  
  const skipToContent = useCallback(() => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView()
    }
  }, [])
  
  const skipToNavigation = useCallback(() => {
    const navigation = document.getElementById('main-navigation')
    if (navigation) {
      navigation.focus()
      navigation.scrollIntoView()
    }
  }, [])
  
  return {
    skipLinksRef,
    skipToContent,
    skipToNavigation
  }
}

// Hook for managing screen reader announcements
export function useScreenReaderAnnouncements() {
  const [announcement, setAnnouncement] = React.useState('')
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement('')
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set the announcement after a brief delay to ensure screen readers pick it up
    timeoutRef.current = setTimeout(() => {
      setAnnouncement(message)
    }, 100)
  }, [])
  
  const clearAnnouncement = useCallback(() => {
    setAnnouncement('')
  }, [])
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  return {
    announcement,
    announce,
    clearAnnouncement
  }
}

// Hook for high contrast mode detection
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = React.useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])
  
  return isHighContrast
}

// Hook for reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])
  
  return prefersReducedMotion
}

// Hook for managing focus indicators
export function useFocusManagement() {
  const [isKeyboardUser, setIsKeyboardUser] = React.useState(false)
  
  useEffect(() => {
    const handleKeyDown = () => {
      setIsKeyboardUser(true)
    }
    
    const handleMouseDown = () => {
      setIsKeyboardUser(false)
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])
  
  return isKeyboardUser
}