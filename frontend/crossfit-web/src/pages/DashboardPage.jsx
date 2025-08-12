import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useWorkout } from '../contexts/WorkoutContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  Dumbbell, 
  Calendar, 
  Target, 
  TrendingUp, 
  Zap,
  Clock,
  Award,
  Activity,
  Plus
} from 'lucide-react'
import { formatDate, formatDuration, getDifficultyColor, getWorkoutTypeColor } from '../lib/utils'
import { motion } from 'framer-motion'

const DashboardPage = () => {
  const { user } = useAuth()
  const { workouts, loading, fetchWorkouts } = useWorkout()
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisWeekWorkouts: 0,
    totalMinutes: 0,
    averageDuration: 0,
    favoriteType: 'HIIT'
  })

  useEffect(() => {
    if (workouts.length > 0) {
      calculateStats()
    }
  }, [workouts])

  const calculateStats = () => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const thisWeekWorkouts = workouts.filter(workout => 
      new Date(workout.created_at) >= weekAgo
    ).length

    const totalMinutes = workouts.reduce((sum, workout) => 
      sum + (workout.duration_minutes || 0), 0
    )

    const averageDuration = workouts.length > 0 
      ? Math.round(totalMinutes / workouts.length) 
      : 0

    // Find most common workout type
    const typeCounts = workouts.reduce((acc, workout) => {
      acc[workout.workout_type] = (acc[workout.workout_type] || 0) + 1
      return acc
    }, {})
    
    const favoriteType = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b, 'HIIT'
    )

    setStats({
      totalWorkouts: workouts.length,
      thisWeekWorkouts,
      totalMinutes,
      averageDuration,
      favoriteType: favoriteType?.toUpperCase() || 'HIIT'
    })
  }

  const recentWorkouts = workouts.slice(0, 3)

  const quickActions = [
    {
      title: 'Generate Workout',
      description: 'Create a new AI-powered workout',
      icon: Zap,
      href: '/generate',
      color: 'bg-yellow-500'
    },
    {
      title: 'Browse Workouts',
      description: 'View all your workouts',
      icon: Dumbbell,
      href: '/workouts',
      color: 'bg-blue-500'
    },
    {
      title: 'View Profile',
      description: 'Update your fitness profile',
      icon: Target,
      href: '/profile',
      color: 'bg-green-500'
    }
  ]

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's your fitness overview and recent activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.thisWeekWorkouts} this week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(stats.totalMinutes)}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatDuration(stats.averageDuration)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Type</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoriteType}</div>
              <p className="text-xs text-muted-foreground">
                Most performed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeekWorkouts}/5</div>
              <Progress value={(stats.thisWeekWorkouts / 5) * 100} className="mt-2" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Jump into your fitness routine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => (
                <Button
                  key={action.title}
                  asChild
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                >
                  <Link to={action.href}>
                    <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Workouts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Recent Workouts
                </CardTitle>
                <CardDescription>
                  Your latest training sessions
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/workouts">
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : recentWorkouts.length > 0 ? (
                <div className="space-y-4">
                  {recentWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Dumbbell className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{workout.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{formatDate(workout.created_at)}</span>
                            <span>•</span>
                            <span>{formatDuration(workout.duration_minutes)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
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
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/workouts/${workout.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No workouts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate your first AI-powered workout to get started!
                  </p>
                  <Button asChild>
                    <Link to="/generate">
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Workout
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievement Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Achievements
            </CardTitle>
            <CardDescription>
              Your fitness milestones and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🔥</div>
                <div className="font-medium">Consistency</div>
                <div className="text-sm text-muted-foreground">
                  {stats.thisWeekWorkouts} workouts this week
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">💪</div>
                <div className="font-medium">Dedication</div>
                <div className="text-sm text-muted-foreground">
                  {stats.totalWorkouts} total workouts
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">⏱️</div>
                <div className="font-medium">Time Invested</div>
                <div className="text-sm text-muted-foreground">
                  {formatDuration(stats.totalMinutes)} total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default DashboardPage

