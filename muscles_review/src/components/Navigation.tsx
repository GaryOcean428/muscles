import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Home,
  MessageCircle,
  Zap,
  Calendar,
  CreditCard,
  User,
  LogOut,
  Dumbbell,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

type PageType = 'dashboard' | 'fitcraft' | 'workouts' | 'calendar' | 'subscription' | 'profile'

interface NavigationProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

const navigationItems = [
  {
    id: 'dashboard' as PageType,
    label: 'Dashboard',
    icon: Home,
    description: 'Your fitness overview'
  },
  {
    id: 'fitcraft' as PageType,
    label: 'FitCraft Coach',
    icon: MessageCircle,
    description: 'AI fitness trainer chat'
  },
  {
    id: 'workouts' as PageType,
    label: 'Workout Generator',
    icon: Zap,
    description: 'Create AI-powered workouts'
  },
  {
    id: 'calendar' as PageType,
    label: 'Calendar',
    icon: Calendar,
    description: 'Schedule your workouts'
  },
  {
    id: 'subscription' as PageType,
    label: 'Subscription',
    icon: CreditCard,
    description: 'Manage your plan'
  }
]

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  const handleNavigate = (page: PageType) => {
    onNavigate(page)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">Muscles AI</h1>
              <p className="text-xs text-gray-600 -mt-1">Fitness Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="space-x-1">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon
                  const isActive = currentPage === item.id
                  
                  return (
                    <NavigationMenuItem key={item.id}>
                      <NavigationMenuLink asChild>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={cn(
                            "flex items-center space-x-2 px-3 py-2",
                            isActive && "bg-blue-500 text-white hover:bg-blue-600"
                          )}
                          onClick={() => onNavigate(item.id)}
                        >
                          <IconComponent className="h-4 w-4" />
                          <span className="hidden lg:inline">{item.label}</span>
                        </Button>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* Subscription Badge */}
            <Badge variant="outline" className="hidden sm:flex">
              {profile?.subscription_plan?.toUpperCase() || 'FREE'}
            </Badge>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:inline font-medium text-sm">
                    {profile?.first_name || profile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{profile?.full_name || 'Fitness Warrior'}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigate('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('subscription')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscription
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                const isActive = currentPage === item.id
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start space-x-3 h-12",
                      isActive && "bg-blue-500 text-white hover:bg-blue-600"
                    )}
                    onClick={() => handleNavigate(item.id)}
                  >
                    <IconComponent className="h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs opacity-75">{item.description}</p>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}