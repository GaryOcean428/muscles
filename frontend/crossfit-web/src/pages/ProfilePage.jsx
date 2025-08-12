import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Settings, 
  Target, 
  Activity,
  Calendar,
  Award
} from 'lucide-react'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    fitness_level: user?.fitness_level || 'intermediate',
    body_type: user?.body_type || 'mesomorph',
    fitness_goals: user?.fitness_goals || '',
    bio: user?.bio || ''
  })

  const handleSave = async () => {
    // Here you would typically call an API to update the user profile
    updateUser(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      fitness_level: user?.fitness_level || 'intermediate',
      body_type: user?.body_type || 'mesomorph',
      fitness_goals: user?.fitness_goals || '',
      bio: user?.bio || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and fitness preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={user?.avatar_url} alt={user?.first_name} />
                <AvatarFallback className="text-lg">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{user?.first_name} {user?.last_name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <div className="flex justify-center space-x-2 mt-4">
                <Badge variant="secondary">
                  {user?.fitness_level || 'Intermediate'}
                </Badge>
                <Badge variant="outline">
                  {user?.body_type || 'Mesomorph'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Member since 2024</span>
                </div>
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Active user</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Fitness enthusiast</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your basic account information
                </CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Fitness Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Fitness Profile
              </CardTitle>
              <CardDescription>
                Your fitness level and body type information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fitness_level">Fitness Level</Label>
                  <Select 
                    value={formData.fitness_level}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, fitness_level: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fitness level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body_type">Body Type</Label>
                  <Select 
                    value={formData.body_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, body_type: value }))}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="fitness_goals">Fitness Goals</Label>
                <Textarea
                  id="fitness_goals"
                  placeholder="What are your fitness goals?"
                  value={formData.fitness_goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, fitness_goals: e.target.value }))}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

