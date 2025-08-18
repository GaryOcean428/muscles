import React, { useState, useEffect } from 'react'
import { supabase, EDGE_FUNCTIONS } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Zap, Clock, Target, Dumbbell, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { WorkoutGenerationRequest, AIGeneratedWorkout, WorkoutExerciseDetail, WorkoutPhase } from '@/types'
import { WORKOUT_TYPES, FITNESS_LEVELS, BODY_TYPES, FITNESS_GOALS, formatDuration } from '@/lib/utils'

interface WorkoutGeneratorProps {
  onWorkoutGenerated?: (workout: AIGeneratedWorkout) => void
}

export default function WorkoutGenerator({ onWorkoutGenerated }: WorkoutGeneratorProps) {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [generatedWorkout, setGeneratedWorkout] = useState<AIGeneratedWorkout | null>(null)
  const [formData, setFormData] = useState({
    workoutType: profile?.fitness_goals?.[0] ? 'HIIT' : '',
    duration: profile?.preferred_duration || 45,
    fitnessLevel: profile?.fitness_level || '',
    bodyType: profile?.body_type || '',
    equipment: profile?.available_equipment || [],
    targetMuscles: profile?.target_body_parts || [],
    goals: profile?.fitness_goals || [],
    injuries: profile?.injury_limitations?.join(', ') || ''
  })

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        workoutType: prev.workoutType || 'HIIT',
        duration: profile.preferred_duration || 45,
        fitnessLevel: profile.fitness_level || 'intermediate',
        bodyType: profile.body_type || 'mesomorph',
        equipment: profile.available_equipment || [],
        targetMuscles: profile.target_body_parts || [],
        goals: profile.fitness_goals || [],
        injuries: profile.injury_limitations?.join(', ') || ''
      }))
    }
  }, [profile])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateWorkout = async () => {
    if (!user || !formData.workoutType) {
      toast.error('Please select a workout type')
      return
    }

    setLoading(true)
    setGeneratedWorkout(null)

    try {
      const request: WorkoutGenerationRequest = {
        userId: user.id,
        workoutType: formData.workoutType,
        duration: formData.duration,
        fitnessLevel: formData.fitnessLevel,
        bodyType: formData.bodyType,
        equipment: formData.equipment,
        targetMuscles: formData.targetMuscles,
        goals: formData.goals,
        injuries: formData.injuries
      }

      console.log('Generating workout with request:', request)

      const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.AI_WORKOUT_GENERATOR, {
        body: request
      })

      if (error) {
        throw new Error(error.message)
      }

      const workout: AIGeneratedWorkout = data.data.workout
      setGeneratedWorkout(workout)
      onWorkoutGenerated?.(workout)
      toast.success('Workout generated successfully!')
      
    } catch (error) {
      console.error('Workout generation error:', error)
      toast.error('Failed to generate workout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const ExerciseCard = ({ exercise, phase }: { exercise: WorkoutExerciseDetail, phase: string }) => (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-900">{exercise.name}</h4>
          <Badge variant="outline" className="text-xs">
            {phase}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-2 text-sm text-gray-600">
          {exercise.sets && (
            <div className="flex items-center gap-1">
              <Dumbbell className="h-3 w-3" />
              <span>{exercise.sets} sets</span>
            </div>
          )}
          {exercise.reps && (
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{exercise.reps} reps</span>
            </div>
          )}
          {exercise.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{exercise.duration}s</span>
            </div>
          )}
          {exercise.rest && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{exercise.rest}s rest</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-700 mb-2">{exercise.instructions}</p>
        
        {exercise.modifications && (
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            <strong>Modification:</strong> {exercise.modifications}
          </div>
        )}
        
        {exercise.equipment && exercise.equipment.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {exercise.equipment.map((item, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const WorkoutPhaseSection = ({ title, phase, exercises }: { title: string, phase: string, exercises: WorkoutExerciseDetail[] }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-500" />
        {title}
      </h3>
      <div className="space-y-2">
        {exercises.map((exercise, idx) => (
          <ExerciseCard key={idx} exercise={exercise} phase={phase} />
        ))}
      </div>
    </div>
  )

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6" />
              AI Workout Generator
            </CardTitle>
            <CardDescription>
              Please sign in to generate personalized workouts
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Workout Generator</h1>
        <p className="text-gray-600">Create personalized workouts tailored to your fitness goals</p>
      </div>

      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Workout Preferences
          </CardTitle>
          <CardDescription>
            Customize your workout based on your goals and available time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Workout Type</label>
              <Select value={formData.workoutType} onValueChange={(value) => handleInputChange('workoutType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WORKOUT_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Select value={formData.duration.toString()} onValueChange={(value) => handleInputChange('duration', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Fitness Level</label>
              <Select value={formData.fitnessLevel} onValueChange={(value) => handleInputChange('fitnessLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fitness level" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FITNESS_LEVELS).map(([key, value]) => (
                    <SelectItem key={key} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Body Type</label>
              <Select value={formData.bodyType} onValueChange={(value) => handleInputChange('bodyType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BODY_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Injuries or Limitations</label>
            <Textarea
              placeholder="Describe any injuries or physical limitations..."
              value={formData.injuries}
              onChange={(e) => handleInputChange('injuries', e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          <Button 
            onClick={generateWorkout} 
            disabled={loading || !formData.workoutType}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Your Workout...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate AI Workout
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Workout */}
      {generatedWorkout && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{generatedWorkout.workoutName}</CardTitle>
                <CardDescription className="mt-1">
                  {generatedWorkout.description || `AI-generated ${generatedWorkout.workoutType} workout`}
                </CardDescription>
              </div>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Generated
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(generatedWorkout.estimatedDuration)}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Target className="h-4 w-4" />
                <span>{generatedWorkout.difficultyLevel}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {generatedWorkout.targetMuscles.map((muscle, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {/* Warm-up */}
              {generatedWorkout.phases?.warmUp && (
                <WorkoutPhaseSection
                  title="Warm-up"
                  phase="warm-up"
                  exercises={generatedWorkout.phases.warmUp.exercises}
                />
              )}
              
              <Separator className="my-4" />
              
              {/* Main Workout */}
              {generatedWorkout.phases?.mainWorkout && (
                <WorkoutPhaseSection
                  title="Main Workout"
                  phase="main"
                  exercises={generatedWorkout.phases.mainWorkout.exercises}
                />
              )}
              
              <Separator className="my-4" />
              
              {/* Cool-down */}
              {generatedWorkout.phases?.coolDown && (
                <WorkoutPhaseSection
                  title="Cool-down"
                  phase="cool-down"
                  exercises={generatedWorkout.phases.coolDown.exercises}
                />
              )}
              
              {/* Coaching Tips */}
              {generatedWorkout.coachingTips && generatedWorkout.coachingTips.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Coaching Tips
                    </h3>
                    <ul className="space-y-2">
                      {generatedWorkout.coachingTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              
              {/* Progression Notes */}
              {generatedWorkout.progressionNotes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-500" />
                      Progression Notes
                    </h3>
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                      <p className="text-sm text-purple-800">{generatedWorkout.progressionNotes}</p>
                    </div>
                  </div>
                </>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}