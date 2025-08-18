import React from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'
import { ErrorInfo } from 'react'

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: {
    fallback?: React.ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    showErrorDetails?: boolean
  }
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for handling async errors
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    console.error('Async error:', error)
    setError(error)
    
    // Log to monitoring service
    // TODO: Integrate with error monitoring
  }, [])

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, resetError }
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Prevent the default browser behavior
    event.preventDefault()
    
    // Log to monitoring service
    // TODO: Integrate with error monitoring
  })

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    
    // Log to monitoring service
    // TODO: Integrate with error monitoring
  })
}

export default withErrorBoundary