import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Update this for production

class WorkoutService {
  async getWorkouts(token: string, params: any = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.type) queryParams.append('type', params.type);

    const response = await axios.get(`${API_BASE_URL}/workouts?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getWorkout(token: string, workoutId: number) {
    const response = await axios.get(`${API_BASE_URL}/workouts/${workoutId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async generateWorkout(token: string, workoutData: any) {
    const response = await axios.post(`${API_BASE_URL}/workouts/generate`, workoutData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async updateWorkout(token: string, workoutId: number, updateData: any) {
    const response = await axios.put(`${API_BASE_URL}/workouts/${workoutId}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async deleteWorkout(token: string, workoutId: number) {
    await axios.delete(`${API_BASE_URL}/workouts/${workoutId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return true;
  }

  async getExerciseTemplates(params: any = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);

    const response = await axios.get(`${API_BASE_URL}/exercise-templates?${queryParams}`);

    return response.data;
  }

  async analyzeWorkoutFeedback(token: string, workoutId: number) {
    const response = await axios.post(`${API_BASE_URL}/workouts/${workoutId}/analyze`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  // Session-related methods
  async startWorkoutSession(token: string, workoutId: number) {
    const response = await axios.post(`${API_BASE_URL}/sessions/start`, {
      workout_id: workoutId,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async updateExercisePerformance(token: string, sessionId: number, exerciseId: number, performanceData: any) {
    const response = await axios.put(`${API_BASE_URL}/sessions/${sessionId}/exercises/${exerciseId}`, performanceData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async completeWorkoutSession(token: string, sessionId: number, sessionData: any) {
    const response = await axios.post(`${API_BASE_URL}/sessions/${sessionId}/complete`, sessionData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getWorkoutSessions(token: string, params: any = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.status) queryParams.append('status', params.status);

    const response = await axios.get(`${API_BASE_URL}/sessions?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
}

export const workoutService = new WorkoutService();

