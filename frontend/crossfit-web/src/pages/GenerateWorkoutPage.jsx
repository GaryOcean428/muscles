import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkout } from '../contexts/WorkoutContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Zap, 
  Dumbbell, 
  Clock, 
  Target,
  Sparkles,
  Loader2
} from 'lucide-react'

const generateWorkoutSchema = z.object({
  workout_type: z.enum(['hiit', 'crossfit', 'strength', 'cardio'], {
    required_error: 'Please select a workout type',
  }),
  duration_minutes: z.number().min(15).max(120),
  use_ai: z.boolean().default(true),
})

const GenerateWorkoutPage = () => {
  const navigate = useNavigate()
  const { generateWorkout, loading } = useWorkout()
  const [focusAreas, setFocusAreas] = useState([])
  const [availableEquipment, setAvailableEquipment] = useState([])
  const [duration, setDuration] = useState([30])
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(generateWorkoutSchema),
    defaultValues: {
      duration_minutes: 30,
      use_ai: true,
    }
  })

  const watchWorkoutType = watch('workout_type')
  const watchUseAI = watch('use_ai')

  const focusAreaOptions = [
    'upper_body',
    'lower_body',
    'core',
    'cardio',
    'strength',
    'flexibility',
    'power',
    'endurance'
  ]

  const equipmentOptions = [
    'dumbbells',
    'barbell',
    'kettlebell',
    'pull_up_bar',
    'resistance_bands',
    'medicine_ball',
    'jump_rope',
    'box',
    'rowing_machine',
    'treadmill'
  ]

  const handleFocusAreaChange = (area, checked) => {
    if (checked) {
      setFocusAreas(prev => [...prev, area])
    } else {
      setFocusAreas(prev => prev.filter(item => item !== area))
    }
  }

  const handleEquipmentChange = (equipment, checked) => {
    if (checked) {
      setAvailableEquipment(prev => [...prev, equipment])
    } else {
      setAvailableEquipment(prev => prev.filter(item => item !== equipment))
    }
  }

  const onSubmit = async (data) => {
    setError('')
    
    const workoutData = {
      ...data,
      duration_minutes: duration[0],
      focus_areas: focusAreas,
      available_equipment: availableEquipment,
    }

    const workout = await generateWorkout(workoutData)
    
    if (workout) {
      navigate(`/workouts/${workout.id}`)
    } else {
      setError('Failed to generate workout. Please try again.')
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
          <Zap className="h-8 w-8 mr-3 text-yellow-500" />
          Generate Workout
        </h1>
        <p className="text-muted-foreground">
          Create a personalized workout tailored to your preferences and goals
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Workout Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Dumbbell className="h-5 w-5 mr-2" />
              Workout Type
            </CardTitle>
            <CardDescription>
              Choose the type of workout you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => setValue('workout_type', value)}>
              <SelectTrigger className={errors.workout_type ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select workout type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hiit">HIIT - High Intensity Interval Training</SelectItem>
                <SelectItem value="crossfit-style">CrossFit-Style - Functional Fitness</SelectItem>
                <SelectItem value="strength">Strength Training</SelectItem>
                <SelectItem value="cardio">Cardio Focused</SelectItem>
              </SelectContent>
            </Select>
            {errors.workout_type && (
              <p className="text-sm text-destructive mt-2">{errors.workout_type.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Duration
            </CardTitle>
            <CardDescription>
              How long do you want your workout to be?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Duration: {duration[0]} minutes</Label>
              </div>
              <Slider
                value={duration}
                onValueChange={setDuration}
                max={120}
                min={15}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>15 min</span>
                <span>60 min</span>
                <span>120 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Focus Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Focus Areas
            </CardTitle>
            <CardDescription>
              Select the muscle groups or fitness aspects you want to target (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {focusAreaOptions.map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={area}
                    checked={focusAreas.includes(area)}
                    onCheckedChange={(checked) => handleFocusAreaChange(area, checked)}
                  />
                  <Label htmlFor={area} className="text-sm capitalize">
                    {area.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Available Equipment</CardTitle>
            <CardDescription>
              Select the equipment you have access to (leave empty for bodyweight only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {equipmentOptions.map((equipment) => (
                <div key={equipment} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipment}
                    checked={availableEquipment.includes(equipment)}
                    onCheckedChange={(checked) => handleEquipmentChange(equipment, checked)}
                  />
                  <Label htmlFor={equipment} className="text-sm capitalize">
                    {equipment.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              AI Enhancement
            </CardTitle>
            <CardDescription>
              Use AI to create a more personalized and intelligent workout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use_ai"
                checked={watchUseAI}
                onCheckedChange={(checked) => setValue('use_ai', checked)}
              />
              <Label htmlFor="use_ai">
                Use AI-powered workout generation (recommended)
              </Label>
            </div>
            {watchUseAI && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  AI will analyze your fitness profile, workout history, and preferences to create 
                  a highly personalized workout with optimal exercise selection, progression, and timing.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || loading}
            className="min-w-48"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Workout
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default GenerateWorkoutPage

