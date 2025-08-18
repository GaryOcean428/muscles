// Core types for the AI Fitness Platform

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id?: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  avatar_url?: string
  fitness_level: string
  fitness_goals: string[]
  available_equipment: string[]
  height_cm?: number
  weight_kg?: number
  date_of_birth?: string
  gender?: string
  medical_conditions: string[]
  injury_limitations: string[]
  workout_frequency?: number
  preferred_duration?: number
  target_body_parts: string[]
  body_type?: string
  activity_level?: string
  subscription_plan: string
  subscription_status: string
  last_workout_date?: string
  total_workouts_completed: number
  preferred_workout_time: string
  created_at: string
  updated_at: string
}

export interface ExerciseTemplate {
  id: string
  name: string
  category: string
  muscle_groups: string[]
  equipment_required: string[]
  difficulty_level: string
  description?: string
  instructions: string
  video_url?: string
  image_url?: string
  tips: string[]
  variations: string[]
  is_public: boolean
  created_by?: string
  created_at: string
}

export interface Workout {
  id: string
  user_id?: string
  name: string
  description?: string
  workout_type: string
  duration_minutes?: number
  difficulty_level?: string
  target_muscles: string[]
  calories_target?: number
  is_generated: boolean
  is_public: boolean
  ai_model_used?: string
  status?: string
  scheduled_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_template_id?: string
  exercise_name: string
  exercise_type: string
  sets?: number
  reps?: string
  weight_percentage?: number
  rest_time_seconds?: number
  duration?: number
  notes?: string
  order_index: number
  equipment_required: string[]
  completed: boolean
  created_at: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  workout_id: string
  started_at: string
  completed_at?: string
  duration_seconds?: number
  duration_minutes?: number
  calories_burned?: number
  perceived_exertion?: number
  notes?: string
  rating?: number
  workout_type?: string
  exercises_completed: number
  total_exercises: number
  intensity_level: string
  completion_rate: number
  workout_data?: any
  personal_records?: any
  status: string
  created_at: string
  updated_at: string
}

export interface AIChatConversation {
  id: string
  user_id: string
  conversation_title?: string
  status: string
  context_type: string
  total_messages: number
  last_message_at: string
  created_at: string
}

export interface AIChatMessage {
  id: string
  conversation_id: string
  user_id: string
  message_type: string
  content: string
  is_from_ai: boolean
  message_context?: any
  voice_input: boolean
  processed_at?: string
  created_at: string
}

export interface AIChatFlowState {
  id: string
  user_id: string
  chat_step: number
  step_data?: any
  completed: boolean
  current_step: boolean
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  workout_id?: string
  event_title: string
  event_description?: string
  start_time: string
  end_time: string
  external_calendar_id?: string
  calendar_provider?: string
  sync_status: string
  created_at: string
  updated_at: string
}

export interface CalendarConnection {
  id: string
  user_id: string
  provider: string
  external_calendar_id?: string
  access_token?: string
  refresh_token?: string
  sync_enabled: boolean
  last_sync_at?: string
  created_at: string
}

export interface FitCraftPlan {
  id: number
  price_id: string
  plan_type: string
  price: number
  monthly_limit: number
  created_at: string
  updated_at: string
}

export interface FitCraftSubscription {
  id: number
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  price_id: string
  status: string
  created_at: string
  updated_at: string
}

// AI Workout Generation Types
export interface WorkoutGenerationRequest {
  userId: string
  workoutType: string
  duration?: number
  fitnessLevel?: string
  bodyType?: string
  equipment?: string[]
  targetMuscles?: string[]
  goals?: string[]
  injuries?: string
}

export interface WorkoutPhase {
  duration: number
  exercises: WorkoutExerciseDetail[]
}

export interface WorkoutExerciseDetail {
  name: string
  sets?: number
  reps?: number | string
  duration?: number
  rest?: number
  equipment?: string[]
  instructions: string
  modifications?: string
}

export interface AIGeneratedWorkout {
  workoutName: string
  workoutType: string
  estimatedDuration: number
  difficultyLevel: string
  targetMuscles: string[]
  phases: {
    warmUp: WorkoutPhase
    mainWorkout: WorkoutPhase
    coolDown: WorkoutPhase
  }
  coachingTips: string[]
  progressionNotes: string
  description?: string
}

// FitCraft Chat Types
export interface FitCraftChatRequest {
  message: string
  conversationId?: string
  userId: string
  currentStep?: number
  stepData?: any
}

export interface FitCraftChatResponse {
  response: string
  conversationId: string
  currentStep: number
  timestamp: string
}

// Subscription Types
export interface SubscriptionPlan {
  type: string
  name: string
  price: string
  monthlyLimit: number
  features: string[]
}

export interface SubscriptionStatus {
  plan: string
  status: string
  currentPeriodEnd?: string
  aiGenerationsUsed: number
  aiGenerationsLimit: number
}

// Voice Input Types
export interface VoiceInputState {
  isListening: boolean
  isSupported: boolean
  transcript: string
  confidence: number
}

// Calendar Integration Types
export interface CalendarSyncStatus {
  provider: string
  connected: boolean
  lastSync?: string
  syncEnabled: boolean
}

// Utility Types
export type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph'
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type WorkoutType = 'HIIT' | 'CrossFit' | 'Strength Training' | 'Cardio' | 'Yoga' | 'Pilates' | 'Bodyweight'
export type FitnessGoal = 'Weight Loss' | 'Muscle Gain' | 'Build Strength' | 'Improve Endurance' | 'Increase Flexibility' | 'General Fitness' | 'Athletic Performance'
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'pro'