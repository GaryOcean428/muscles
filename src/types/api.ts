// API Response Types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  hasMore: boolean
}

// Workout Generation API
export interface WorkoutGenerationRequest {
  fitness_level: string
  duration_minutes: number
  equipment_available: string[]
  target_muscle_groups?: string[]
  workout_type?: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed'
  user_preferences?: {
    avoid_exercises?: string[]
    focus_areas?: string[]
    intensity_preference?: 'low' | 'moderate' | 'high'
  }
}

export interface GeneratedWorkout {
  id: string
  name: string
  description: string
  duration_minutes: number
  difficulty_level: string
  exercises: GeneratedExercise[]
  warm_up: GeneratedExercise[]
  cool_down: GeneratedExercise[]
  estimated_calories: number
  tips: string[]
}

export interface GeneratedExercise {
  name: string
  description: string
  sets: number
  reps: number | string
  duration_seconds?: number
  rest_seconds: number
  muscle_groups: string[]
  instructions: string[]
  modifications?: string[]
}

// AI Chat API
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: {
    workout_generated?: boolean
    plan_recommended?: boolean
    step_completed?: boolean
  }
}

export interface ChatSessionState {
  current_step: number
  total_steps: number
  user_data: Partial<Profile>
  onboarding_complete: boolean
  goals_assessed: boolean
  plan_generated: boolean
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

export interface ValidationError {
  field: string
  message: string
  code: string
}