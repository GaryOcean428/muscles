const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fitforge.up.railway.app/api'

class WorkoutService {
  async getWorkouts(token, params = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page)
    if (params.per_page) queryParams.append('per_page', params.per_page)
    if (params.type) queryParams.append('type', params.type)

    const response = await fetch(`${API_BASE_URL}/workouts?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch workouts')
    }

    return data
  }

  async getWorkout(token, workoutId) {
    const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch workout')
    }

    return data
  }

  async generateWorkout(token, workoutData) {
    const response = await fetch(`${API_BASE_URL}/workouts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(workoutData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate workout')
    }

    return data
  }

  async updateWorkout(token, workoutId, updateData) {
    const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update workout')
    }

    return data
  }

  async deleteWorkout(token, workoutId) {
    const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete workout')
    }

    return true
  }

  async getExerciseTemplates(params = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.category) queryParams.append('category', params.category)
    if (params.difficulty) queryParams.append('difficulty', params.difficulty)

    const response = await fetch(`${API_BASE_URL}/exercise-templates?${queryParams}`)

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch exercise templates')
    }

    return data
  }

  async analyzeWorkoutFeedback(token, workoutId) {
    const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze workout feedback')
    }

    return data
  }

  // Session-related methods
  async startWorkoutSession(token, workoutId) {
    const response = await fetch(`${API_BASE_URL}/sessions/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ workout_id: workoutId }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to start workout session')
    }

    return data
  }

  async updateExercisePerformance(token, sessionId, exerciseId, performanceData) {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/exercises/${exerciseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(performanceData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update exercise performance')
    }

    return data
  }

  async completeWorkoutSession(token, sessionId, sessionData) {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(sessionData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to complete workout session')
    }

    return data
  }

  async getWorkoutSessions(token, params = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page)
    if (params.per_page) queryParams.append('per_page', params.per_page)
    if (params.status) queryParams.append('status', params.status)

    const response = await fetch(`${API_BASE_URL}/sessions?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch workout sessions')
    }

    return data
  }
}

export const workoutService = new WorkoutService()

