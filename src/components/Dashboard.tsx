import React, { memo, useMemo, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Activity, 
  Calendar, 
  Target, 
  TrendingUp, 
  MessageCircle, 
  Zap, 
  Clock,
  Award,
  Dumbbell,
  Heart
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { DashboardStats, PageProps } from '@/types'
import { DashboardSkeleton } from '@/components/LoadingScreen'

// Memoized components for better performance
const QuickActionCard = memo(({ icon: Icon, title, description, onClick, color }: {
  icon: React.ComponentType<any>
  title: string
  description: string
  onClick: () => void
  color: string
}) => (
  <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]" onClick={onClick}>
    <CardContent className="p-6">
      <div className="flex items-center space-x-3">
        <div className={`p-2 ${color} rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
))
QuickActionCard.displayName = 'QuickActionCard'

const StatCard = memo(({ icon: Icon, value, label, color }: {
  icon: React.ComponentType<any>
  value: string | number
  label: string
  color: string
}) => (
  <div className="text-center">
    <div className={`p-3 ${color} rounded-lg inline-flex`}>
      <Icon className="h-6 w-6" />
    </div>
    <p className="text-2xl font-bold mt-2">{value}</p>
    <p className="text-sm text-gray-600">{label}</p>
  </div>
))
StatCard.displayName = 'StatCard'

const FitnessProgressCard = memo(({ profile }: { profile: any }) => {
  const fitnessLevelProgress = useMemo(() => ({
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100
  }), [])

  const currentProgress = useMemo(() => 
    fitnessLevelProgress[profile.fitness_level as keyof typeof fitnessLevelProgress] || 50,
    [profile.fitness_level, fitnessLevelProgress]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Fitness Level Progress
        </CardTitle>
        <CardDescription>
          Current level: {profile.fitness_level?.charAt(0).toUpperCase() + profile.fitness_level?.slice(1)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{currentProgress}%</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
          <div className="grid grid-cols-4 text-xs text-gray-500">
            <span>Beginner</span>
            <span>Intermediate</span>
            <span>Advanced</span>
            <span>Expert</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
FitnessProgressCard.displayName = 'FitnessProgressCard'

function Dashboard({ onNavigate }: PageProps) {
  const { user, profile } = useAuth()

  // Memoized values for expensive calculations
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const motivationalMessage = useMemo(() => {
    const messages = [
      "Ready to crush your fitness goals today?",
      "Your strongest muscle is your determination!",
      "Every workout brings you closer to your goals!",
      "Consistency is key to your success!",
      "Transform your body, transform your life!"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }, [])

  const dashboardStats = useMemo((): DashboardStats => ({
    workouts_completed: profile?.total_workouts_completed || 0,
    active_goals: profile?.fitness_goals?.length || 0,
    preferred_duration: profile?.preferred_duration || 45,
    weekly_frequency: profile?.workout_frequency || 3,
    current_streak: 0, // TODO: Calculate from workout history
    total_calories_burned: 0 // TODO: Calculate from workout sessions
  }), [profile])

  // Memoized navigation handlers
  const handleNavigateToFitcraft = useCallback(() => onNavigate?.('fitcraft'), [onNavigate])
  const handleNavigateToWorkouts = useCallback(() => onNavigate?.('workouts'), [onNavigate])
  const handleNavigateToCalendar = useCallback(() => onNavigate?.('calendar'), [onNavigate])

  if (!user || !profile) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {greeting}, {profile.first_name || profile.full_name || 'Fitness Warrior'}!
              </h1>
              <p className="text-gray-600 mt-1">{motivationalMessage}</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {profile.subscription_plan.toUpperCase()} Plan
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <QuickActionCard
            icon={MessageCircle}
            title="FitCraft Coach"
            description="Chat with your AI trainer"
            onClick={handleNavigateToFitcraft}
            color="bg-blue-500"
          />
          <QuickActionCard
            icon={Zap}
            title="Generate Workout"
            description="AI-powered workout creation"
            onClick={handleNavigateToWorkouts}
            color="bg-green-500"
          />
          <QuickActionCard
            icon={Calendar}
            title="Schedule Workouts"
            description="Plan your fitness routine"
            onClick={handleNavigateToCalendar}
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fitness Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Fitness Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    icon={Dumbbell}
                    value={dashboardStats.workouts_completed}
                    label="Workouts Completed"
                    color="bg-blue-50 text-blue-500"
                  />
                  <StatCard
                    icon={Target}
                    value={dashboardStats.active_goals}
                    label="Active Goals"
                    color="bg-green-50 text-green-500"
                  />
                  <StatCard
                    icon={Clock}
                    value={formatDuration(dashboardStats.preferred_duration)}
                    label="Preferred Duration"
                    color="bg-purple-50 text-purple-500"
                  />
                  <StatCard
                    icon={Heart}
                    value={dashboardStats.weekly_frequency}
                    label="Weekly Frequency"
                    color="bg-orange-50 text-orange-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Fitness Level Progress */}
            <FitnessProgressCard profile={profile} />
          </div>

          {/* Profile & Goals */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Body Type</p>
                  <p className="font-medium">{profile.body_type?.charAt(0).toUpperCase() + profile.body_type?.slice(1) || 'Not specified'}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-gray-600">Physical Stats</p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {profile.height_cm && (
                      <div>
                        <span className="text-sm">Height: </span>
                        <span className="font-medium">{profile.height_cm}cm</span>
                      </div>
                    )}
                    {profile.weight_kg && (
                      <div>
                        <span className="text-sm">Weight: </span>
                        <span className="font-medium">{profile.weight_kg}kg</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-gray-600">Fitness Goals</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.fitness_goals?.length > 0 ? (
                      profile.fitness_goals.map((goal: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {goal}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No goals set</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Complete a workout to see your progress here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Dashboard)