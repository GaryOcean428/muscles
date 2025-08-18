// UI Component Types
export type PageType = 'dashboard' | 'fitcraft' | 'workouts' | 'calendar' | 'subscription' | 'profile'

export interface NavigationItem {
  id: PageType
  label: string
  icon: React.ComponentType<any>
  description?: string
  badge?: string | number
  disabled?: boolean
}

export interface DashboardStats {
  workouts_completed: number
  active_goals: number
  preferred_duration: number
  weekly_frequency: number
  current_streak: number
  total_calories_burned: number
}

export interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
}

export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  title?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Form Types
export interface FormState<T> {
  data: T
  errors: Record<keyof T, string>
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
}

export interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

// Modal Types
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

// Table Types
export interface TableColumn<T> {
  key: keyof T
  header: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    current: number
    total: number
    pageSize: number
    onChange: (page: number) => void
  }
  selection?: {
    selectedRows: string[]
    onSelectionChange: (selected: string[]) => void
  }
}