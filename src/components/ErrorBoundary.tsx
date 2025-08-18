import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { AppError } from '@/types'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showErrorDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to monitoring service (e.g., Sentry)
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Integrate with error monitoring service
    const errorData: AppError = {
      code: 'REACT_ERROR_BOUNDARY',
      message: error.message,
      details: {
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }

    // For now, just log to console in development
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorData)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-900">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription>
                We encountered an unexpected error. Don't worry, we're working on fixing this.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.props.showErrorDetails && this.state.error && (
                <div className="bg-gray-100 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-2">Error Details:</p>
                  <p className="text-xs text-gray-600 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRetry} 
                  className="flex-1 flex items-center gap-2"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleGoHome} 
                  className="flex-1 flex items-center gap-2"
                  variant="outline"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                If this problem persists, please contact our support team.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary