import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useWorkout } from '../contexts/WorkoutContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Clock,
  Target,
  Dumbbell,
  Play,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react'
import { formatDate, formatDuration, getDifficultyColor, getWorkoutTypeColor } from '../lib/utils'

const WorkoutDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentWorkout, loading, fetchWorkout, deleteWorkout } = useWorkout()

  useEffect(() => {
    if (id) {
      fetchWorkout(parseInt(id))
    }
  }, [id])

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      const success = await deleteWorkout(parseInt(id))
      if (success) {
        navigate('/workouts')
      }
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!currentWorkout) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Workout not found</h1>
          <Button asChild>
            <Link to="/workouts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workouts
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild>
          <Link to="/workouts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workouts
          </Link>
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Workout Overview */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{currentWorkout.name}</CardTitle>
              <CardDescription className="text-base">
                {currentWorkout.description}
              </CardDescription>
            </div>
            <Button size="lg">
              <Play className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <Badge 
              variant="secondary" 
              className={getWorkoutTypeColor(currentWorkout.workout_type)}
            >
              {currentWorkout.workout_type?.toUpperCase()}
            </Badge>
            <Badge 
              variant="outline"
              className={getDifficultyColor(currentWorkout.difficulty_level)}
            >
              {currentWorkout.difficulty_level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-muted-foreground mr-3" />
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-sm text-muted-foreground">
                  {formatDuration(currentWorkout.duration_minutes)}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Target className="h-5 w-5 text-muted-foreground mr-3" />
              <div>
                <div className="font-medium">Exercises</div>
                <div className="text-sm text-muted-foreground">
                  {currentWorkout.exercises?.length || 0} exercises
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
              <div>
                <div className="font-medium">Created</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(currentWorkout.created_at)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Dumbbell className="h-5 w-5 mr-2" />
            Exercises
          </CardTitle>
          <CardDescription>
            Complete these exercises in order
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentWorkout.exercises && currentWorkout.exercises.length > 0 ? (
            <div className="space-y-6">
              {currentWorkout.exercises.map((exercise, index) => (
                <div key={exercise.id || index}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-lg mb-2">{exercise.exercise_name}</h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Sets</div>
                          <div className="font-medium">{exercise.sets}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Reps</div>
                          <div className="font-medium">{exercise.reps}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Rest</div>
                          <div className="font-medium">{exercise.rest_time_seconds}s</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Equipment</div>
                          <div className="font-medium">{exercise.equipment_required || 'None'}</div>
                        </div>
                      </div>

                      {exercise.notes && (
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                          {exercise.notes}
                        </div>
                      )}

                      <Badge variant="outline" className="mt-2">
                        {exercise.exercise_type}
                      </Badge>
                    </div>
                  </div>
                  {index < currentWorkout.exercises.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No exercises found for this workout</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default WorkoutDetailPage

