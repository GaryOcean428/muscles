import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import AuthPage from '@/components/AuthPage'
import Dashboard from '@/components/Dashboard'
import FitCraftCoach from '@/components/FitCraftCoach'
import WorkoutGenerator from '@/components/WorkoutGenerator'
import Subscription from '@/components/Subscription'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

type PageType = 'dashboard' | 'fitcraft' | 'workouts' | 'calendar' | 'subscription' | 'profile'

function AppContent() {
  const { user, profile, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')

  // Redirect to dashboard after successful authentication
  useEffect(() => {
    if (user && currentPage !== 'dashboard') {
      // Only redirect if we're not already on a specific page
      const shouldRedirect = !['fitcraft', 'workouts', 'calendar', 'subscription', 'profile'].includes(currentPage)
      if (shouldRedirect) {
        setCurrentPage('dashboard')
      }
    }
  }, [user, currentPage])

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
            <CardTitle>Muscles AI Fitness</CardTitle>
            <CardDescription>Loading your fitness journey...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Show authentication page if user is not signed in
  if (!user) {
    return <AuthPage />
  }

  // Handle auth callback (for email verification)
  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashFragment = window.location.hash
      if (hashFragment && hashFragment.length > 0) {
        // This would be handled by Supabase auth automatically
        // Just clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    handleAuthCallback()
  }, [])

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />
      case 'fitcraft':
        return <FitCraftCoach />
      case 'workouts':
        return <WorkoutGenerator />
      case 'subscription':
        return <Subscription />
      case 'calendar':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="text-center">
                <CardTitle>Calendar Integration</CardTitle>
                <CardDescription>Coming soon! Schedule and sync your workouts with your calendar.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button onClick={() => setCurrentPage('dashboard')} variant="outline">
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      case 'profile':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="text-center">
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Customize your fitness profile and preferences.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button onClick={() => setCurrentPage('dashboard')} variant="outline">
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}