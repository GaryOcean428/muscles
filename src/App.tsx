import React, { useState, useEffect, Suspense, lazy } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingScreen from '@/components/LoadingScreen'
import Navigation from '@/components/Navigation'
import { SkipLinks, LiveRegion, FocusIndicator } from '@/components/Accessibility'
import { 
  SEOHead, 
  DashboardSEO, 
  WorkoutGeneratorSEO, 
  FitCraftCoachSEO, 
  CalendarSEO, 
  ProfileSEO, 
  SubscriptionSEO 
} from '@/components/SEO'
import { setupGlobalErrorHandlers } from '@/utils/errorHandling'
import { initializeMonitoring } from '@/utils/monitoring'
import { PageType } from '@/types'

// Lazy load components for better performance
const AuthPage = lazy(() => import('@/components/AuthPage'))
const Dashboard = lazy(() => import('@/components/Dashboard'))
const FitCraftCoach = lazy(() => import('@/components/FitCraftCoach'))
const WorkoutGenerator = lazy(() => import('@/components/WorkoutGenerator'))
const Subscription = lazy(() => import('@/components/Subscription'))
const CalendarPage = lazy(() => import('@/components/CalendarPage'))
const ProfilePage = lazy(() => import('@/components/ProfilePage'))

// Create a query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
})

// Setup global error handlers and monitoring
setupGlobalErrorHandlers()
initializeMonitoring()

function AppContent() {
  const { user, profile, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')

  // Handle authentication state changes
  useEffect(() => {
    if (user && currentPage !== 'dashboard') {
      // Only redirect if we're not already on a specific page
      const validPages: PageType[] = ['fitcraft', 'workouts', 'calendar', 'subscription', 'profile']
      const shouldRedirect = !validPages.includes(currentPage)
      if (shouldRedirect) {
        setCurrentPage('dashboard')
      }
    }
  }, [user, currentPage])

  // Handle auth callback cleanup
  useEffect(() => {
    const handleAuthCallback = () => {
      const hashFragment = window.location.hash
      if (hashFragment && hashFragment.length > 0) {
        // Clean up the URL after auth callback
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    handleAuthCallback()
  }, [])

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen message="Loading your fitness journey..." />
  }

  // Show authentication page if user is not signed in
  if (!user) {
    return (
      <Suspense fallback={<LoadingScreen message="Loading authentication..." />}>
        <AuthPage />
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLinks />
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main id="main-content" tabIndex={-1} role="main" aria-label="Main content">
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Page error:', error, errorInfo)
            // TODO: Log to monitoring service
          }}
          showErrorDetails={import.meta.env.DEV}
        >
          <Suspense fallback={<LoadingScreen />}>
            <PageRenderer currentPage={currentPage} onNavigate={setCurrentPage} />
          </Suspense>
        </ErrorBoundary>
      </main>
      <LiveRegion />
    </div>
  )
}

// Separate component for rendering pages
interface PageRendererProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

function PageRenderer({ currentPage, onNavigate }: PageRendererProps) {
  const pageComponents = {
    dashboard: Dashboard,
    fitcraft: FitCraftCoach,
    workouts: WorkoutGenerator,
    calendar: CalendarPage,
    subscription: Subscription,
    profile: ProfilePage,
  } as const

  const seoComponents = {
    dashboard: DashboardSEO,
    fitcraft: FitCraftCoachSEO,
    workouts: WorkoutGeneratorSEO,
    calendar: CalendarSEO,
    subscription: SubscriptionSEO,
    profile: ProfileSEO,
  } as const

  const PageComponent = pageComponents[currentPage]
  const SEOComponent = seoComponents[currentPage]

  if (!PageComponent) {
    console.warn(`Unknown page: ${currentPage}. Falling back to Dashboard.`)
    return (
      <>
        <DashboardSEO />
        <Dashboard onNavigate={onNavigate} />
      </>
    )
  }

  return (
    <>
      <SEOComponent />
      <PageComponent onNavigate={onNavigate} />
    </>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('App-level error:', error, errorInfo)
          // TODO: Log to monitoring service
        }}
        showErrorDetails={import.meta.env.DEV}
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <FocusIndicator />
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
              aria-live="polite"
            />
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  )
}