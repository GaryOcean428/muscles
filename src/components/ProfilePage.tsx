import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Download,
  Trash2,
  Edit
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PageProps } from '@/types'

export default function ProfilePage({ onNavigate }: PageProps) {
  const { user, profile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || user?.email || '',
    age: profile?.age || '',
    height_cm: profile?.height_cm || '',
    weight_kg: profile?.weight_kg || '',
    body_type: profile?.body_type || '',
    fitness_level: profile?.fitness_level || '',
    workout_frequency: profile?.workout_frequency || 3,
    preferred_duration: profile?.preferred_duration || 45
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // TODO: Implement profile update API call
    console.log('Saving profile:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset form data
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || user?.email || '',
      age: profile?.age || '',
      height_cm: profile?.height_cm || '',
      weight_kg: profile?.weight_kg || '',
      body_type: profile?.body_type || '',
      fitness_level: profile?.fitness_level || '',
      workout_frequency: profile?.workout_frequency || 3,
      preferred_duration: profile?.preferred_duration || 45
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="h-6 w-6" />
                Profile Settings
              </h1>
              <p className="text-gray-600 mt-1">Manage your account and fitness preferences</p>
            </div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="fitness">Fitness</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height_cm}
                      onChange={(e) => handleInputChange('height_cm', parseInt(e.target.value))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight_kg}
                      onChange={(e) => handleInputChange('weight_kg', parseInt(e.target.value))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fitness Settings */}
          <TabsContent value="fitness" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fitness Profile</CardTitle>
                <CardDescription>
                  Customize your fitness preferences and goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Body Type</Label>
                    <Select 
                      value={formData.body_type} 
                      onValueChange={(value) => handleInputChange('body_type', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ectomorph">Ectomorph</SelectItem>
                        <SelectItem value="mesomorph">Mesomorph</SelectItem>
                        <SelectItem value="endomorph">Endomorph</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fitness Level</Label>
                    <Select 
                      value={formData.fitness_level} 
                      onValueChange={(value) => handleInputChange('fitness_level', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fitness level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Workout Frequency (per week)</Label>
                    <Select 
                      value={formData.workout_frequency.toString()} 
                      onValueChange={(value) => handleInputChange('workout_frequency', parseInt(value))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'time' : 'times'} per week
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Duration (minutes)</Label>
                    <Select 
                      value={formData.preferred_duration.toString()} 
                      onValueChange={(value) => handleInputChange('preferred_duration', parseInt(value))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Current Subscription</h4>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {profile?.subscription_plan?.toUpperCase() || 'FREE'} Plan
                      </Badge>
                      <p className="text-sm text-gray-600">
                        {profile?.subscription_plan === 'free' 
                          ? 'Upgrade to unlock premium features'
                          : 'Enjoying premium features'
                        }
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => onNavigate?.('subscription')}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive updates and reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Workout Reminders', description: 'Get reminded about scheduled workouts' },
                  { label: 'Progress Updates', description: 'Weekly progress and achievement notifications' },
                  { label: 'AI Coach Messages', description: 'Personalized tips and motivation from FitCraft' },
                  { label: 'Community Updates', description: 'News about new features and community challenges' },
                  { label: 'Marketing Emails', description: 'Product updates and fitness tips' }
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                    <Switch defaultChecked={index < 3} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
                <CardDescription>
                  Manage your account security and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-gray-600">Download your fitness data and history</p>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-red-600">Delete Account</p>
                    <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                variant="outline"
                onClick={() => onNavigate?.('dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}