import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Plus, ExternalLink, Settings } from 'lucide-react'
import { PageProps } from '@/types'

interface CalendarEvent {
  id: string
  title: string
  type: 'workout' | 'rest' | 'nutrition'
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'missed'
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'HIIT Cardio Session',
    type: 'workout',
    date: '2025-08-19',
    time: '07:00',
    duration: 45,
    status: 'scheduled'
  },
  {
    id: '2',
    title: 'Upper Body Strength',
    type: 'workout',
    date: '2025-08-20',
    time: '18:30',
    duration: 60,
    status: 'scheduled'
  },
  {
    id: '3',
    title: 'Recovery Day',
    type: 'rest',
    date: '2025-08-21',
    time: '00:00',
    duration: 0,
    status: 'scheduled'
  }
]

export default function CalendarPage({ onNavigate }: PageProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [view, setView] = useState<'week' | 'month'>('week')

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'workout': return 'bg-blue-500'
      case 'rest': return 'bg-green-500'
      case 'nutrition': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case 'missed': return <Badge variant="destructive">Missed</Badge>
      case 'scheduled': return <Badge variant="outline">Scheduled</Badge>
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Workout Calendar
              </h1>
              <p className="text-gray-600 mt-1">Schedule and track your fitness routine</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Workout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={view} onValueChange={(v) => setView(v as 'week' | 'month')} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="week">Week View</TabsTrigger>
              <TabsTrigger value="month">Month View</TabsTrigger>
            </TabsList>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar View */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>August 2025</CardTitle>
                  <CardDescription>
                    Click on any day to view or schedule workouts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TabsContent value="week" className="mt-0">
                    <div className="space-y-4">
                      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600">
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                        <div>Sun</div>
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 7 }, (_, i) => {
                          const date = new Date()
                          date.setDate(date.getDate() - date.getDay() + 1 + i)
                          const dateStr = date.toISOString().split('T')[0]
                          const dayEvents = mockEvents.filter(e => e.date === dateStr)
                          
                          return (
                            <div
                              key={i}
                              className={`min-h-32 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                selectedDate === dateStr ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                              }`}
                              onClick={() => setSelectedDate(dateStr)}
                            >
                              <div className="text-sm font-medium text-gray-900 mb-2">
                                {date.getDate()}
                              </div>
                              <div className="space-y-1">
                                {dayEvents.map(event => (
                                  <div
                                    key={event.id}
                                    className={`text-xs p-1 rounded text-white ${getEventTypeColor(event.type)}`}
                                  >
                                    <div className="font-medium truncate">{event.title}</div>
                                    <div className="opacity-90">{event.time}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="month" className="mt-0">
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Month view coming soon!</p>
                      <p className="text-sm">Full calendar integration with Google Calendar and Outlook</p>
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Selected Day Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockEvents.filter(e => e.date === selectedDate).map(event => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          {getStatusBadge(event.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </span>
                          {event.duration > 0 && (
                            <span>{event.duration} min</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {mockEvents.filter(e => e.date === selectedDate).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No workouts scheduled</p>
                        <Button variant="outline" size="sm" className="mt-3">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Workout
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Calendar Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Calendar Sync</CardTitle>
                  <CardDescription>
                    Connect your external calendars
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Google Calendar
                    <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Outlook Calendar
                    <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onNavigate?.('workouts')}
                  >
                    Generate AI Workout
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onNavigate?.('fitcraft')}
                  >
                    Chat with Coach
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onNavigate?.('dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}