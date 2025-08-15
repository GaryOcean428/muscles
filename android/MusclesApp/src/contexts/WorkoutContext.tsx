import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {workoutService} from '../services/workoutService';
import {useAuth} from './AuthContext';

interface Exercise {
  id: number;
  exercise_name: string;
  exercise_type: string;
  sets: number;
  reps: string;
  rest_time_seconds: number;
  equipment_required?: string;
  notes?: string;
}

interface Workout {
  id: number;
  name: string;
  description: string;
  workout_type: string;
  difficulty_level: string;
  duration_minutes: number;
  created_at: string;
  exercises: Exercise[];
}

interface WorkoutContextType {
  workouts: Workout[];
  currentWorkout: Workout | null;
  loading: boolean;
  exerciseTemplates: any[];
  fetchWorkouts: (page?: number, type?: string) => Promise<any>;
  fetchWorkout: (workoutId: number) => Promise<Workout | null>;
  generateWorkout: (workoutData: any) => Promise<Workout | null>;
  updateWorkout: (workoutId: number, updateData: any) => Promise<Workout | null>;
  deleteWorkout: (workoutId: number) => Promise<boolean>;
  fetchExerciseTemplates: (category?: string, difficulty?: string) => Promise<any[]>;
  setCurrentWorkout: (workout: Workout | null) => void;
}

const WorkoutContext = createContext<WorkoutContextType>({} as WorkoutContextType);

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

interface WorkoutProviderProps {
  children: ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({children}) => {
  const {token, isAuthenticated} = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(false);
  const [exerciseTemplates, setExerciseTemplates] = useState<any[]>([]);

  // Fetch user's workouts
  const fetchWorkouts = async (page = 1, type: string | null = null) => {
    if (!isAuthenticated || !token) return {workouts: [], total: 0};

    try {
      setLoading(true);
      const response = await workoutService.getWorkouts(token, {page, type});
      setWorkouts(response.workouts);
      return response;
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
      return {workouts: [], total: 0};
    } finally {
      setLoading(false);
    }
  };

  // Fetch single workout
  const fetchWorkout = async (workoutId: number): Promise<Workout | null> => {
    if (!isAuthenticated || !token) return null;

    try {
      setLoading(true);
      const response = await workoutService.getWorkout(token, workoutId);
      setCurrentWorkout(response.workout);
      return response.workout;
    } catch (error) {
      console.error('Failed to fetch workout:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generate new workout
  const generateWorkout = async (workoutData: any): Promise<Workout | null> => {
    if (!isAuthenticated || !token) return null;

    try {
      setLoading(true);
      const response = await workoutService.generateWorkout(token, workoutData);
      
      // Add to workouts list
      setWorkouts(prev => [response.workout, ...prev]);
      
      return response.workout;
    } catch (error) {
      console.error('Failed to generate workout:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update workout
  const updateWorkout = async (workoutId: number, updateData: any): Promise<Workout | null> => {
    if (!isAuthenticated || !token) return null;

    try {
      setLoading(true);
      const response = await workoutService.updateWorkout(token, workoutId, updateData);
      
      // Update in workouts list
      setWorkouts(prev => 
        prev.map(workout => 
          workout.id === workoutId ? response.workout : workout
        )
      );
      
      // Update current workout if it's the same
      if (currentWorkout?.id === workoutId) {
        setCurrentWorkout(response.workout);
      }
      
      return response.workout;
    } catch (error) {
      console.error('Failed to update workout:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete workout
  const deleteWorkout = async (workoutId: number): Promise<boolean> => {
    if (!isAuthenticated || !token) return false;

    try {
      setLoading(true);
      await workoutService.deleteWorkout(token, workoutId);
      
      // Remove from workouts list
      setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));
      
      // Clear current workout if it's the same
      if (currentWorkout?.id === workoutId) {
        setCurrentWorkout(null);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete workout:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch exercise templates
  const fetchExerciseTemplates = async (category?: string, difficulty?: string): Promise<any[]> => {
    try {
      const response = await workoutService.getExerciseTemplates({category, difficulty});
      setExerciseTemplates(response.templates);
      return response.templates;
    } catch (error) {
      console.error('Failed to fetch exercise templates:', error);
      return [];
    }
  };

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkouts();
      fetchExerciseTemplates();
    }
  }, [isAuthenticated]);

  const value: WorkoutContextType = {
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
    setCurrentWorkout,
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
};

