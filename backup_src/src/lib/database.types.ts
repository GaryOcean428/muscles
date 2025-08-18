export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_chat_conversations: {
        Row: {
          context_type: string | null
          conversation_title: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          status: string | null
          total_messages: number | null
          user_id: string | null
        }
        Insert: {
          context_type?: string | null
          conversation_title?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          total_messages?: number | null
          user_id?: string | null
        }
        Update: {
          context_type?: string | null
          conversation_title?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          total_messages?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_chat_flow_state: {
        Row: {
          chat_step: number | null
          completed: boolean | null
          created_at: string | null
          current_step: boolean | null
          id: string
          step_data: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chat_step?: number | null
          completed?: boolean | null
          created_at?: string | null
          current_step?: boolean | null
          id?: string
          step_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chat_step?: number | null
          completed?: boolean | null
          created_at?: string | null
          current_step?: boolean | null
          id?: string
          step_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          is_from_ai: boolean | null
          message_context: Json | null
          message_type: string | null
          processed_at: string | null
          user_id: string | null
          voice_input: boolean | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_from_ai?: boolean | null
          message_context?: Json | null
          message_type?: string | null
          processed_at?: string | null
          user_id?: string | null
          voice_input?: boolean | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_from_ai?: boolean | null
          message_context?: Json | null
          message_type?: string | null
          processed_at?: string | null
          user_id?: string | null
          voice_input?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          user_id: string | null
          email: string
          first_name: string | null
          last_name: string | null
          full_name: string | null
          avatar_url: string | null
          fitness_level: string
          fitness_goals: string[]
          available_equipment: string[]
          height_cm: number | null
          weight_kg: number | null
          date_of_birth: string | null
          gender: string | null
          medical_conditions: string[]
          injury_limitations: string[]
          workout_frequency: number | null
          preferred_duration: number | null
          target_body_parts: string[]
          body_type: string | null
          activity_level: string | null
          subscription_plan: string
          subscription_status: string
          last_workout_date: string | null
          total_workouts_completed: number
          preferred_workout_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id?: string | null
          email: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          fitness_level?: string
          fitness_goals?: string[]
          available_equipment?: string[]
          height_cm?: number | null
          weight_kg?: number | null
          date_of_birth?: string | null
          gender?: string | null
          medical_conditions?: string[]
          injury_limitations?: string[]
          workout_frequency?: number | null
          preferred_duration?: number | null
          target_body_parts?: string[]
          body_type?: string | null
          activity_level?: string | null
          subscription_plan?: string
          subscription_status?: string
          last_workout_date?: string | null
          total_workouts_completed?: number
          preferred_workout_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          fitness_level?: string
          fitness_goals?: string[]
          available_equipment?: string[]
          height_cm?: number | null
          weight_kg?: number | null
          date_of_birth?: string | null
          gender?: string | null
          medical_conditions?: string[]
          injury_limitations?: string[]
          workout_frequency?: number | null
          preferred_duration?: number | null
          target_body_parts?: string[]
          body_type?: string | null
          activity_level?: string | null
          subscription_plan?: string
          subscription_status?: string
          last_workout_date?: string | null
          total_workouts_completed?: number
          preferred_workout_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
  }
}