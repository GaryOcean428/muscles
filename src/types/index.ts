// Re-export all types for easy importing
export * from './database'
export * from './api'
export * from './ui'

// Common utility types
export type Nullable<T> = T | null
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// React component types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  'data-testid'?: string
}

export interface PageProps {
  onNavigate?: (page: PageType) => void
}

// Environment variables
export interface EnvConfig {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
  VITE_STRIPE_PUBLISHABLE_KEY?: string
  VITE_APP_ENV: 'development' | 'staging' | 'production'
  VITE_API_BASE_URL?: string
}

// Global state types
export interface AppState {
  user: any | null
  profile: Profile | null
  loading: boolean
  error: AppError | null
  notifications: NotificationState[]
  theme: 'light' | 'dark' | 'system'
  sidebar: {
    isOpen: boolean
    isCollapsed: boolean
  }
}

// Event types
export interface AppEvent {
  type: string
  payload?: any
  timestamp: string
  user_id?: string
}

export interface AnalyticsEvent extends AppEvent {
  category: 'user' | 'workout' | 'subscription' | 'navigation'
  action: string
  label?: string
  value?: number
}