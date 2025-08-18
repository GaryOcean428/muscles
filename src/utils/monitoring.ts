// Web Vitals and Performance Monitoring
export class PerformanceTracker {
  private static instance: PerformanceTracker
  private metrics: Map<string, number[]> = new Map()
  private vitals: { [key: string]: number } = {}

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker()
    }
    return PerformanceTracker.instance
  }

  // Track Core Web Vitals
  trackWebVitals() {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.vitals.LCP = lastEntry.startTime
      this.sendMetric('LCP', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach(entry => {
        this.vitals.FID = entry.processingStart - entry.startTime
        this.sendMetric('FID', entry.processingStart - entry.startTime)
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((entryList) => {
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.vitals.CLS = clsValue
      this.sendMetric('CLS', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // Track custom metrics
  trackMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)
    this.sendMetric(name, value)
  }

  // Track page load times
  trackPageLoad() {
    if (typeof window === 'undefined') return

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      const metrics = {
        TTFB: navigation.responseStart - navigation.fetchStart,
        DOMContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        LoadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        FullLoadTime: navigation.loadEventEnd - navigation.fetchStart
      }

      Object.entries(metrics).forEach(([name, value]) => {
        this.trackMetric(name, value)
      })
    })
  }

  // Track user interactions
  trackUserInteraction(action: string, category: string, label?: string, value?: number) {
    this.sendEvent({
      event: 'user_interaction',
      action,
      category,
      label,
      value
    })
  }

  // Track errors
  trackError(error: Error, context?: string) {
    this.sendEvent({
      event: 'error',
      error_message: error.message,
      error_stack: error.stack,
      context,
      timestamp: Date.now()
    })
  }

  // Send metrics to analytics service
  private sendMetric(name: string, value: number) {
    // In production, send to your analytics service
    if (import.meta.env.PROD) {
      // Example: Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'performance_metric', {
          metric_name: name,
          metric_value: value,
          custom_parameter: true
        })
      }
    } else {
      console.log(`Performance Metric - ${name}:`, value)
    }
  }

  // Send events to analytics service
  private sendEvent(event: Record<string, any>) {
    // In production, send to your analytics service
    if (import.meta.env.PROD) {
      // Example: Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', event.event, event)
      }
    } else {
      console.log('Analytics Event:', event)
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    return {
      vitals: this.vitals,
      customMetrics: Object.fromEntries(
        Array.from(this.metrics.entries()).map(([name, values]) => [
          name,
          {
            average: values.reduce((sum, val) => sum + val, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            count: values.length
          }
        ])
      )
    }
  }
}

// User Analytics
export class UserAnalytics {
  private static instance: UserAnalytics
  private sessionStart = Date.now()
  private pageViews: string[] = []

  static getInstance(): UserAnalytics {
    if (!UserAnalytics.instance) {
      UserAnalytics.instance = new UserAnalytics()
    }
    return UserAnalytics.instance
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    this.pageViews.push(path)
    
    if (import.meta.env.PROD) {
      // Send to analytics service
      if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: path,
          page_title: title
        })
      }
    } else {
      console.log('Page View:', { path, title })
    }
  }

  // Track user actions
  trackAction(action: string, properties?: Record<string, any>) {
    const event = {
      action,
      timestamp: Date.now(),
      session_duration: Date.now() - this.sessionStart,
      page_views_count: this.pageViews.length,
      ...properties
    }

    if (import.meta.env.PROD) {
      // Send to analytics service
      if (typeof gtag !== 'undefined') {
        gtag('event', action, event)
      }
    } else {
      console.log('User Action:', event)
    }
  }

  // Track workout generation
  trackWorkoutGeneration(workoutType: string, duration: number, fitnessLevel: string) {
    this.trackAction('workout_generated', {
      workout_type: workoutType,
      duration,
      fitness_level: fitnessLevel
    })
  }

  // Track subscription events
  trackSubscription(event: 'subscribe' | 'cancel' | 'upgrade' | 'downgrade', plan: string) {
    this.trackAction('subscription_event', {
      subscription_event: event,
      plan
    })
  }

  // Track fitness goals
  trackGoalSet(goals: string[]) {
    this.trackAction('goals_set', {
      goals_count: goals.length,
      goals: goals.join(', ')
    })
  }

  // Track user engagement
  trackEngagement() {
    const sessionDuration = Date.now() - this.sessionStart
    
    this.trackAction('session_end', {
      session_duration: sessionDuration,
      pages_visited: this.pageViews.length,
      unique_pages: new Set(this.pageViews).size
    })
  }
}

// Error Tracking
export class ErrorTracker {
  private static instance: ErrorTracker
  private errors: Array<{ error: Error; context?: string; timestamp: number }> = []

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  // Initialize error tracking
  init() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason), {
        type: 'unhandled_promise_rejection'
      })
    })
  }

  // Capture and report errors
  captureError(error: Error, context?: Record<string, any>) {
    const errorInfo = {
      error,
      context,
      timestamp: Date.now()
    }

    this.errors.push(errorInfo)

    // Send to error tracking service (e.g., Sentry)
    if (import.meta.env.PROD) {
      // Example: Sentry
      // Sentry.captureException(error, { contexts: { additional: context } })
    } else {
      console.error('Error captured:', error, context)
    }
  }

  // Get error summary
  getErrorSummary() {
    const errorsByType = this.errors.reduce((acc, { error }) => {
      const type = error.constructor.name
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total_errors: this.errors.length,
      errors_by_type: errorsByType,
      recent_errors: this.errors.slice(-5)
    }
  }
}

// Health Check System
export class HealthChecker {
  private static instance: HealthChecker
  private checks: Map<string, () => Promise<boolean>> = new Map()
  private status: Map<string, { healthy: boolean; lastCheck: number; error?: string }> = new Map()

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker()
    }
    return HealthChecker.instance
  }

  // Register health checks
  registerCheck(name: string, checkFn: () => Promise<boolean>) {
    this.checks.set(name, checkFn)
  }

  // Run all health checks
  async runChecks(): Promise<Record<string, any>> {
    const results: Record<string, any> = {}

    for (const [name, checkFn] of this.checks) {
      try {
        const healthy = await checkFn()
        this.status.set(name, { healthy, lastCheck: Date.now() })
        results[name] = { healthy, status: healthy ? 'pass' : 'fail' }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        this.status.set(name, { healthy: false, lastCheck: Date.now(), error: errorMessage })
        results[name] = { healthy: false, status: 'error', error: errorMessage }
      }
    }

    return {
      timestamp: Date.now(),
      overall_status: Object.values(results).every(r => r.healthy) ? 'healthy' : 'unhealthy',
      checks: results
    }
  }

  // Initialize default health checks
  initDefaultChecks() {
    // API connectivity check
    this.registerCheck('api_connectivity', async () => {
      try {
        const response = await fetch('/api/health', { method: 'HEAD' })
        return response.ok
      } catch {
        return false
      }
    })

    // Local storage check
    this.registerCheck('local_storage', async () => {
      try {
        const testKey = '__health_check__'
        localStorage.setItem(testKey, 'test')
        const value = localStorage.getItem(testKey)
        localStorage.removeItem(testKey)
        return value === 'test'
      } catch {
        return false
      }
    })

    // Browser compatibility check
    this.registerCheck('browser_compatibility', async () => {
      return !!(window.fetch && window.Promise && window.Map && window.Set)
    })
  }
}

// React hooks for monitoring
export function usePerformanceTracking() {
  const performance = PerformanceTracker.getInstance()
  
  return {
    trackMetric: performance.trackMetric.bind(performance),
    trackUserInteraction: performance.trackUserInteraction.bind(performance),
    trackError: performance.trackError.bind(performance)
  }
}

export function useUserAnalytics() {
  const analytics = UserAnalytics.getInstance()
  
  return {
    trackPageView: analytics.trackPageView.bind(analytics),
    trackAction: analytics.trackAction.bind(analytics),
    trackWorkoutGeneration: analytics.trackWorkoutGeneration.bind(analytics),
    trackSubscription: analytics.trackSubscription.bind(analytics),
    trackGoalSet: analytics.trackGoalSet.bind(analytics)
  }
}

// Initialize monitoring
export function initializeMonitoring() {
  const performance = PerformanceTracker.getInstance()
  const errorTracker = ErrorTracker.getInstance()
  const healthChecker = HealthChecker.getInstance()

  // Start tracking
  performance.trackWebVitals()
  performance.trackPageLoad()
  errorTracker.init()
  healthChecker.initDefaultChecks()

  // Run health checks periodically
  setInterval(() => {
    healthChecker.runChecks()
  }, 5 * 60 * 1000) // Every 5 minutes
}