import { createContext, useContext, useState, useEffect } from 'react'
import { workoutService } from '../services/workoutService'
import { useAuth } from './AuthContext'
import { toast } from 'sonner'

const WorkoutContext = createContext({})

export const useWorkout = () => {
  const context = useContext(WorkoutContext)
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider')
  }
  return context
}

export const WorkoutProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [currentWorkout, setCurrentWorkout] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exerciseTemplates, setExerciseTemplates] = useState([])

  // Fetch user's workouts
  const fetchWorkouts = async (page = 1, type = null) => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const response = await workoutService.getWorkouts(token, { page, type })
      setWorkouts(response.workouts)
      return response
    } catch (error) {
      console.error('Failed to fetch workouts:', error)
      toast.error('Failed to load workouts')
      return { workouts: [], total: 0 }
    } finally {
      setLoading(false)
    }
  }

  // Fetch single workout
  const fetchWorkout = async (workoutId) => {
    if (!isAuthenticated) return null

    try {
      setLoading(true)
      const response = await workoutService.getWorkout(token, workoutId)
      setCurrentWorkout(response.workout)
      return response.workout
    } catch (error) {
      console.error('Failed to fetch workout:', error)
      toast.error('Failed to load workout')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Generate new workout
  const generateWorkout = async (workoutData) => {
    if (!isAuthenticated) return null

    try {
      setLoading(true)
      const response = await workoutService.generateWorkout(token, workoutData)
      
      // Add to workouts list
      setWorkouts(prev => [response.workout, ...prev])
      
      toast.success(response.message || 'Workout generated successfully!')
      return response.workout
    } catch (error) {
      console.error('Failed to generate workout:', error)
      toast.error(error.message || 'Failed to generate workout')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update workout
  const updateWorkout = async (workoutId, updateData) => {
    if (!isAuthenticated) return null

    try {
      setLoading(true)
      const response = await workoutService.updateWorkout(token, workoutId, updateData)
      
      // Update in workouts list
      setWorkouts(prev => 
        prev.map(workout => 
          workout.id === workoutId ? response.workout : workout
        )
      )
      
      // Update current workout if it's the same
      if (currentWorkout?.id === workoutId) {
        setCurrentWorkout(response.workout)
      }
      
      toast.success('Workout updated successfully!')
      return response.workout
    } catch (error) {
      console.error('Failed to update workout:', error)
      toast.error('Failed to update workout')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Delete workout
  const deleteWorkout = async (workoutId) => {
    if (!isAuthenticated) return false

    try {
      setLoading(true)
      await workoutService.deleteWorkout(token, workoutId)
      
      // Remove from workouts list
      setWorkouts(prev => prev.filter(workout => workout.id !== workoutId))
      
      // Clear current workout if it's the same
      if (currentWorkout?.id === workoutId) {
        setCurrentWorkout(null)
      }
      
      toast.success('Workout deleted successfully!')
      return true
    } catch (error) {
      console.error('Failed to delete workout:', error)
      toast.error('Failed to delete workout')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Fetch exercise templates
  const fetchExerciseTemplates = async (category = null, difficulty = null) => {
    try {
      const response = await workoutService.getExerciseTemplates({ category, difficulty })
      setExerciseTemplates(response.templates)
      return response.templates
    } catch (error) {
      console.error('Failed to fetch exercise templates:', error)
      return []
    }
  }

  // Analyze workout feedback
  const analyzeWorkoutFeedback = async (workoutId) => {
    if (!isAuthenticated) return null

    try {
      setLoading(true)
      const response = await workoutService.analyzeWorkoutFeedback(token, workoutId)
      return response
    } catch (error) {
      console.error('Failed to analyze workout feedback:', error)
      toast.error('Failed to analyze workout feedback')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkouts()
      fetchExerciseTemplates()
    }
  }, [isAuthenticated])

  const value = {
    workouts,
    currentWorkout,
    loading,
    exerciseTemplates,
    fetchWorkouts,
    fetchWorkout,
    generateWorkout,
    updateWorkout,
    deleteWorkout,
    fetchExerciseTemplates,
    analyzeWorkoutFeedback,
    setCurrentWorkout
  }

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  )
}

