import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWorkout } from '../contexts/WorkoutContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Dumbbell, 
  Search, 
  Filter, 
  Plus,
  Calendar,
  Clock,
  Target
} from 'lucide-react'
import { formatDate, formatDuration, getDifficultyColor, getWorkoutTypeColor } from '../lib/utils'

const WorkoutsPage = () => {
  const { workouts, loading, fetchWorkouts } = useWorkout()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filteredWorkouts, setFilteredWorkouts] = useState([])

  useEffect(() => {
    fetchWorkouts()
  }, [])

  useEffect(() => {
    let filtered = workouts

    if (searchTerm) {
      filtered = filtered.filter(workout =>
        workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workout.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(workout => workout.workout_type === filterType)
    }

    setFilteredWorkouts(filtered)
  }, [workouts, searchTerm, filterType])

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Workouts</h1>
          <p className="text-muted-foreground">
            Manage and track your workout collection
          </p>
        </div>
        <Button asChild>
          <Link to="/generate">
            <Plus className="h-4 w-4 mr-2" />
            Generate Workout
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="hiit">HIIT</SelectItem>
            <SelectItem value="crossfit">CrossFit</SelectItem>
            <SelectItem value="strength">Strength</SelectItem>
            <SelectItem value="cardio">Cardio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Workouts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWorkouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkouts.map((workout) => (
            <Card key={workout.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{workout.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {workout.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <Badge 
                    variant="secondary" 
                    className={getWorkoutTypeColor(workout.workout_type)}
                  >
                    {workout.workout_type?.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={getDifficultyColor(workout.difficulty_level)}
                  >
                    {workout.difficulty_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatDuration(workout.duration_minutes)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(workout.created_at)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Target className="h-4 w-4 mr-2" />
                    {workout.exercises?.length || 0} exercises
                  </div>
                  <Button asChild className="w-full mt-4">
                    <Link to={`/workouts/${workout.id}`}>
                      View Workout
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">
            {searchTerm || filterType !== 'all' ? 'No workouts found' : 'No workouts yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Generate your first AI-powered workout to get started!'
            }
          </p>
          <Button asChild>
            <Link to="/generate">
              <Plus className="h-4 w-4 mr-2" />
              Generate Workout
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default WorkoutsPage

