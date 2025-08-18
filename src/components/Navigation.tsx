import React, { memo, useMemo, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  MessageCircle,
  Dumbbell,
  Calendar,
  CreditCard,
  User,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { PageType, NavigationItem } from '@/types'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

interface NavigationProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

// Memoized navigation item component
const NavItem = memo(({ item, isActive, onClick }: {
  item: NavigationItem
  isActive: boolean
  onClick: () => void
}) => {
  const Icon = item.icon
  
  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      className={`flex items-center gap-2 justify-start w-full ${isActive ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900'}`}
      onClick={onClick}
      disabled={item.disabled}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{item.label}</span>
      {item.badge && (
        <Badge variant="secondary" className="ml-auto">
          {item.badge}
        </Badge>
      )}
    </Button>
  )
})
NavItem.displayName = 'NavItem'

// Memoized user menu component
const UserMenu = memo(({ user, profile, onSignOut }: {
  user: any
  profile: any
  onSignOut: () => void
}) => {
  const userInitials = useMemo(() => {
    const name = profile?.full_name || profile?.first_name || user?.email || 'U'
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }, [profile, user])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || 'User'} />
            <AvatarFallback className="bg-blue-500 text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.full_name || profile?.first_name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile?.email || user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
UserMenu.displayName = 'UserMenu'

// Main navigation component
function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { user, profile } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Memoized navigation items
  const navigationItems = useMemo((): NavigationItem[] => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview of your fitness journey'
    },
    {
      id: 'fitcraft',
      label: 'FitCraft Coach',
      icon: MessageCircle,
      description: 'AI-powered personal trainer'
    },
    {
      id: 'workouts',
      label: 'Workouts',
      icon: Dumbbell,
      description: 'Generate and manage workouts'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      description: 'Schedule your fitness routine'
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: CreditCard,
      description: 'Manage your plan and billing',
      badge: profile?.subscription_plan === 'free' ? 'Upgrade' : undefined
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Account settings and preferences'
    }
  ], [profile?.subscription_plan])

  // Memoized handlers
  const handleNavigate = useCallback((page: PageType) => {
    onNavigate(page)
    setIsMobileMenuOpen(false)
  }, [onNavigate])

  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:inline">
              Muscles AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={currentPage === item.id}
                onClick={() => handleNavigate(item.id)}
              />
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            <UserMenu user={user} profile={profile} onSignOut={handleSignOut} />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={currentPage === item.id}
                  onClick={() => handleNavigate(item.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default memo(Navigation)