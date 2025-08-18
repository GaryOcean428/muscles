import React, { memo } from 'react'
import { useFocusTrap, useScreenReaderAnnouncements } from '@/hooks/useAccessibility'

// Skip links component for keyboard navigation
export const SkipLinks = memo(() => {
  return (
    <div className="skip-links sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-0 left-0 z-50 p-2 bg-blue-600 text-white focus:relative focus:z-auto"
        onClick={(e) => {
          e.preventDefault()
          const mainContent = document.getElementById('main-content')
          if (mainContent) {
            mainContent.focus()
            mainContent.scrollIntoView()
          }
        }}
      >
        Skip to main content
      </a>
      <a
        href="#main-navigation"
        className="absolute top-0 left-0 z-50 p-2 bg-blue-600 text-white focus:relative focus:z-auto"
        onClick={(e) => {
          e.preventDefault()
          const navigation = document.getElementById('main-navigation')
          if (navigation) {
            navigation.focus()
            navigation.scrollIntoView()
          }
        }}
      >
        Skip to navigation
      </a>
    </div>
  )
})
SkipLinks.displayName = 'SkipLinks'

// Screen reader only text component
export const ScreenReaderOnly = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
})
ScreenReaderOnly.displayName = 'ScreenReaderOnly'

// Live region for screen reader announcements
export const LiveRegion = memo(() => {
  const { announcement } = useScreenReaderAnnouncements()
  
  return (
    <>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="polite-announcements"
      >
        {announcement}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="assertive-announcements"
      />
    </>
  )
})
LiveRegion.displayName = 'LiveRegion'

// Accessible modal component with focus trap
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const AccessibleModal = memo(({
  isOpen,
  onClose,
  title,
  children,
  description,
  size = 'md'
}: AccessibleModalProps) => {
  const focusTrapRef = useFocusTrap(isOpen)
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }
  
  if (!isOpen) return null
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={focusTrapRef as React.RefObject<HTMLDivElement>}
        className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="modal-title" className="text-xl font-semibold">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {description && (
            <p id="modal-description" className="text-gray-600 mb-4">
              {description}
            </p>
          )}
          
          {children}
        </div>
      </div>
    </div>
  )
})
AccessibleModal.displayName = 'AccessibleModal'

// Accessible button with proper ARIA attributes
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
  'aria-describedby'?: string
}

export const AccessibleButton = memo(({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: AccessibleButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <ScreenReaderOnly>Loading...</ScreenReaderOnly>
        </>
      )}
      {children}
    </button>
  )
})
AccessibleButton.displayName = 'AccessibleButton'

// Focus indicator component
export const FocusIndicator = memo(() => {
  return (
    <style jsx global>{`
      .focus-visible:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      
      .focus-visible:focus:not(.focus-visible) {
        outline: none;
      }
      
      /* High contrast mode styles */
      @media (prefers-contrast: high) {
        .focus-visible:focus {
          outline: 3px solid;
          outline-offset: 3px;
        }
      }
      
      /* Reduced motion styles */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `}</style>
  )
})
FocusIndicator.displayName = 'FocusIndicator'