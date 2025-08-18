import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, TABLES } from '@/lib/supabase'
import { UserProfile } from '@/types'
import { toast } from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: any }>
  signOut: () => Promise<{ error?: any }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user and profile on mount
  useEffect(() => {
    let mounted = true

    async function loadUser() {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (!mounted) return

        if (error) {
          console.error('Error loading user:', error)
          return
        }

        setUser(currentUser)
        
        if (currentUser) {
          await loadProfile(currentUser.id)
        }
      } catch (error) {
        console.error('Error in loadUser:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadUser()

    // Set up auth listener - KEEP SIMPLE, no async operations
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return
        
        const currentUser = session?.user || null
        setUser(currentUser)
        
        if (currentUser && event === 'SIGNED_IN') {
          // Load profile after sign in
          loadProfile(currentUser.id)
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error loading profile:', error)
        return
      }

      if (data) {
        setProfile(data)
      } else {
        // Create default profile if none exists
        const { data: newProfile, error: createError } = await supabase
          .from(TABLES.PROFILES)
          .insert({
            id: userId,
            email: user?.email || '',
            fitness_level: 'intermediate',
            fitness_goals: [],
            available_equipment: [],
            medical_conditions: [],
            injury_limitations: [],
            target_body_parts: [],
            subscription_plan: 'free',
            subscription_status: 'inactive',
            total_workouts_completed: 0,
            preferred_workout_time: 'morning'
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
        } else {
          setProfile(newProfile)
        }
      }
    } catch (error) {
      console.error('Error in loadProfile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        toast.error(error.message)
        return { error }
      }

      toast.success('Welcome back!')
      return { error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('An unexpected error occurred')
      return { error }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        toast.error(error.message)
        return { error }
      }

      toast.success('Check your email to verify your account!')
      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error('An unexpected error occurred')
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast.error(error.message)
        return { error }
      }

      setUser(null)
      setProfile(null)
      toast.success('Signed out successfully')
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('An unexpected error occurred')
      return { error }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        toast.error('Failed to update profile')
        return { error }
      }

      setProfile(data)
      toast.success('Profile updated successfully')
      return { error: null }
    } catch (error) {
      console.error('Error in updateProfile:', error)
      toast.error('An unexpected error occurred')
      return { error }
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}