import React from 'react'
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

interface DashboardProps {
  onNavigate: (page: 'dashboard' | 'fitcraft' | 'workouts' | 'calendar' | 'subscription' | 'profile') => void
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user, profile } = useAuth()

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to crush your fitness goals today?",
      "Your strongest muscle is your determination!",
      "Every workout brings you closer to your goals!",
      "Consistency is key to your success!",
      "Transform your body, transform your life!"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const fitnessLevelProgress = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {profile.first_name || profile.full_name || 'Fitness Warrior'}!
              </h1>
              <p className="text-gray-600 mt-1">{getMotivationalMessage()}</p>
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
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('fitcraft')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">FitCraft Coach</h3>
                  <p className="text-sm text-gray-600">Chat with your AI trainer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('workouts')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Generate Workout</h3>
                  <p className="text-sm text-gray-600">AI-powered workout creation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('calendar')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Schedule Workouts</h3>
                  <p className="text-sm text-gray-600">Plan your fitness routine</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  <div className="text-center">
                    <div className="p-3 bg-blue-50 rounded-lg inline-flex">
                      <Dumbbell className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold mt-2">{profile.total_workouts_completed}</p>
                    <p className="text-sm text-gray-600">Workouts Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="p-3 bg-green-50 rounded-lg inline-flex">
                      <Target className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold mt-2">{profile.fitness_goals?.length || 0}</p>
                    <p className="text-sm text-gray-600">Active Goals</p>
                  </div>
                  <div className="text-center">
                    <div className="p-3 bg-purple-50 rounded-lg inline-flex">
                      <Clock className="h-6 w-6 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold mt-2">{formatDuration(profile.preferred_duration || 45)}</p>
                    <p className="text-sm text-gray-600">Preferred Duration</p>
                  </div>
                  <div className="text-center">
                    <div className="p-3 bg-orange-50 rounded-lg inline-flex">
                      <Heart className="h-6 w-6 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold mt-2">{profile.workout_frequency || 3}</p>
                    <p className="text-sm text-gray-600">Weekly Frequency</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fitness Level Progress */}
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
                    <span>{fitnessLevelProgress[profile.fitness_level as keyof typeof fitnessLevelProgress] || 50}%</span>
                  </div>
                  <Progress 
                    value={fitnessLevelProgress[profile.fitness_level as keyof typeof fitnessLevelProgress] || 50} 
                    className="h-2"
                  />
                  <div className="grid grid-cols-4 text-xs text-gray-500">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Advanced</span>
                    <span>Expert</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <p className="text-sm text-gray-600">Available Equipment</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.available_equipment?.length > 0 ? (
                      profile.available_equipment.map((equipment, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {equipment}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No equipment specified</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fitness Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Fitness Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.fitness_goals?.length > 0 ? (
                    profile.fitness_goals.map((goal, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{goal}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No goals set yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => onNavigate('profile')}
                      >
                        Set Goals
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}