import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  EXERCISE_TEMPLATES: 'exercise_templates',
  WORKOUTS: 'workouts',
  WORKOUT_EXERCISES: 'workout_exercises',
  WORKOUT_SESSIONS: 'workout_sessions',
  AI_CHAT_CONVERSATIONS: 'ai_chat_conversations',
  AI_CHAT_MESSAGES: 'ai_chat_messages',
  AI_CHAT_FLOW_STATE: 'ai_chat_flow_state',
  CALENDAR_EVENTS: 'calendar_events',
  CALENDAR_CONNECTIONS: 'calendar_connections',
  FITCRAFT_PLANS: 'fitcraft_plans',
  FITCRAFT_SUBSCRIPTIONS: 'fitcraft_subscriptions'
} as const

// Storage buckets
export const STORAGE_BUCKETS = {
  FITNESS_CONTENT: 'fitness-content'
} as const

// Edge function names
export const EDGE_FUNCTIONS = {
  FITCRAFT_AI_CHAT: 'fitcraft-ai-chat',
  AI_WORKOUT_GENERATOR: 'ai-workout-generator',
  CREATE_SUBSCRIPTION: 'create-subscription',
  STRIPE_WEBHOOK: 'stripe-webhook'
} as const