import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { LoadingState } from '@/types'

interface LoadingScreenProps {
  message?: string
  progress?: number
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingScreen({ 
  message = "Loading...", 
  progress,
  showProgress = false,
  size = 'md'
}: LoadingScreenProps) {
  const sizeClasses = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg'
  }

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className={sizeClasses[size]}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
            <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
          </div>
          <CardTitle>Muscles AI Fitness</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {showProgress && typeof progress === 'number' && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

// Skeleton components for specific loading states
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          {/* Quick actions skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}