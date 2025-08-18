// Database Types for Supabase
export interface Profile {
  id: string
  user_id: string
  email: string
  full_name?: string
  first_name?: string
  last_name?: string
  age?: number
  height_cm?: number
  weight_kg?: number
  body_type?: 'ectomorph' | 'mesomorph' | 'endomorph'
  fitness_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  fitness_goals?: string[]
  preferred_duration?: number
  workout_frequency?: number
  subscription_plan: 'free' | 'basic' | 'premium' | 'enterprise'
  total_workouts_completed: number
  created_at: string
  updated_at: string
}

export interface WorkoutTemplate {
  id: string
  name: string
  description?: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  target_muscle_groups: string[]
  equipment_needed: string[]
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  name: string
  description: string
  muscle_groups: string[]
  equipment: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  instructions: string[]
  video_url?: string
  image_url?: string
  tips?: string[]
  created_at: string
  updated_at: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  workout_id: string
  started_at: string
  completed_at?: string
  duration_minutes?: number
  calories_burned?: number
  notes?: string
  rating?: number
  exercises_completed: ExerciseLog[]
  created_at: string
}

export interface ExerciseLog {
  exercise_id: string
  sets: number
  reps: number[]
  weight_kg?: number[]
  duration_seconds?: number
  notes?: string
}

export interface AIConversation {
  id: string
  user_id: string
  title: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface AIMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: Record<string, any>
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'inactive' | 'cancelled' | 'past_due'
  current_period_start: string
  current_period_end: string
  stripe_subscription_id?: string
  created_at: string
  updated_at: string
}