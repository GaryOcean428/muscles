import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface AsyncErrorBoundaryProps {
  error: Error | null
  retry: () => void
  isRetrying?: boolean
  children: React.ReactNode
}

export function AsyncErrorBoundary({ 
  error, 
  retry, 
  isRetrying = false, 
  children 
}: AsyncErrorBoundaryProps) {
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-lg text-red-900">Failed to Load</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            {error.message || 'An unexpected error occurred'}
          </p>
          <Button 
            onClick={retry} 
            disabled={isRetrying}
            className="flex items-center gap-2"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}

export default AsyncErrorBoundary