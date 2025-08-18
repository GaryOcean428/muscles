import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initializeMonitoring, useUserAnalytics, usePerformanceTracking } from '@/utils/monitoring'
import { prefetchPages, preloadCriticalResources } from '@/utils/seo'

// Global monitoring initialization
export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const analytics = useUserAnalytics()
  const performance = usePerformanceTracking()
  const location = useLocation()

  useEffect(() => {
    // Initialize monitoring systems
    initializeMonitoring()
    
    // Preload critical resources
    preloadCriticalResources([
      { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
      { href: '/css/critical.css', as: 'style' }
    ])
    
    // Prefetch likely next pages
    prefetchPages([
      '/dashboard',
      '/workouts',
      '/fitcraft'
    ])
  }, [])

  // Track page views
  useEffect(() => {
    analytics.trackPageView(location.pathname, document.title)
  }, [location.pathname, analytics])

  // Track user engagement on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      analytics.trackAction('session_end', {
        final_page: location.pathname,
        session_duration: Date.now() - window.performance.timing.navigationStart
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [analytics, location.pathname])

  // Track performance issues
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure' && entry.duration > 100) {
          performance.trackMetric('slow_operation', entry.duration)
        }
      })
    })
    
    observer.observe({ entryTypes: ['measure'] })
    
    return () => observer.disconnect()
  }, [performance])

  return <>{children}</>
}

// SEO and Analytics hooks
export function useSEOAnalytics() {
  const analytics = useUserAnalytics()
  
  return {
    trackWorkoutGenerated: (type: string, duration: number, level: string) => {
      analytics.trackWorkoutGeneration(type, duration, level)
    },
    trackGoalsSet: (goals: string[]) => {
      analytics.trackGoalSet(goals)
    },
    trackSubscriptionEvent: (event: 'subscribe' | 'cancel' | 'upgrade' | 'downgrade', plan: string) => {
      analytics.trackSubscription(event, plan)
    },
    trackFeatureUsage: (feature: string, properties?: Record<string, any>) => {
      analytics.trackAction(`feature_used_${feature}`, properties)
    }
  }
}

// Performance optimization component
export function PerformanceOptimizer() {
  useEffect(() => {
    // Optimize images
    const images = document.querySelectorAll('img')
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
          }
          imageObserver.unobserve(img)
        }
      })
    })
    
    images.forEach(img => {
      if (img.dataset.src) {
        imageObserver.observe(img)
      }
    })
    
    // Optimize font loading
    if ('fonts' in document) {
      Promise.all([
        document.fonts.load('400 16px Inter'),
        document.fonts.load('500 16px Inter'),
        document.fonts.load('600 16px Inter')
      ]).then(() => {
        document.documentElement.classList.add('fonts-loaded')
      })
    }
    
    return () => imageObserver.disconnect()
  }, [])
  
  return null
}

// Component for tracking workout interactions
export function WorkoutAnalytics({ children }: { children: React.ReactNode }) {
  const analytics = useSEOAnalytics()
  
  const handleWorkoutGeneration = (workoutData: {
    type: string
    duration: number
    fitnessLevel: string
    equipment: string[]
    targetMuscles: string[]
  }) => {
    analytics.trackWorkoutGenerated(workoutData.type, workoutData.duration, workoutData.fitnessLevel)
    
    // Track additional workout details
    analytics.trackFeatureUsage('workout_generator', {
      equipment_count: workoutData.equipment.length,
      target_muscles_count: workoutData.targetMuscles.length,
      equipment_types: workoutData.equipment.join(', '),
      target_muscles: workoutData.targetMuscles.join(', ')
    })
  }
  
  const handleFitCraftInteraction = (interaction: {
    type: 'message_sent' | 'plan_generated' | 'tip_received'
    messageLength?: number
    planType?: string
  }) => {
    analytics.trackFeatureUsage('fitcraft_coach', {
      interaction_type: interaction.type,
      message_length: interaction.messageLength,
      plan_type: interaction.planType
    })
  }
  
  return (
    <div
      data-workout-analytics
      onWorkoutGenerated={handleWorkoutGeneration}
      onFitCraftInteraction={handleFitCraftInteraction}
    >
      {children}
    </div>
  )
}

// Component for A/B testing (future enhancement)
export function ABTestProvider({ children }: { children: React.ReactNode }) {
  const [experiments] = React.useState<Record<string, string>>({})
  
  // In a real implementation, this would load experiments from a service
  React.useEffect(() => {
    // Example: Load A/B test configurations
    // setExperiments(await loadExperiments())
  }, [])
  
  return (
    <div data-experiments={JSON.stringify(experiments)}>
      {children}
    </div>
  )
}

export default MonitoringProvider