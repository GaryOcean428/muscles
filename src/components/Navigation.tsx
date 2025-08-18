import React, { memo, useMemo, useCallback } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { ScreenReaderOnly } from '@/components/Accessibility'
import { useFocusManagement, useKeyboardNavigation } from '@/hooks/useAccessibility'

interface NavigationProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

// Memoized navigation item component with accessibility
const NavItem = memo(({ item, isActive, onClick }: {
  item: NavigationItem
  isActive: boolean
  onClick: () => void
}) => {
  const Icon = item.icon
  
  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      className={`flex items-center gap-2 justify-start w-full min-h-12 ${isActive ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900'}`}
      onClick={onClick}
      disabled={item.disabled}
      aria-current={isActive ? 'page' : undefined}
      aria-describedby={item.description ? `${item.id}-description` : undefined}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{item.label}</span>
      <ScreenReaderOnly id={`${item.id}-description`}>
        {item.description}
      </ScreenReaderOnly>
      {item.badge && (
        <Badge variant="secondary" className="ml-auto" aria-label={`${item.label} ${item.badge}`}>
          {item.badge}
        </Badge>
      )}
    </Button>
  )
})
NavItem.displayName = 'NavItem'

// Memoized user menu component with accessibility
const UserMenu = memo(({ user, profile, onSignOut }: {
  user: any
  profile: any
  onSignOut: () => void
}) => {
  const userInitials = useMemo(() => {
    const name = profile?.full_name || profile?.first_name || user?.email || 'U'
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }, [profile, user])

  const userName = profile?.full_name || profile?.first_name || 'User'
  const userEmail = profile?.email || user?.email

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`User menu for ${userName}`}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={profile?.avatar_url} 
              alt={`${userName} profile picture`} 
            />
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
              {userName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer focus:bg-gray-100">
          <User className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer focus:bg-gray-100">
          <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer focus:bg-red-50 focus:text-red-700" 
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
UserMenu.displayName = 'UserMenu'

// Main navigation component with full accessibility
function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { user, profile } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isKeyboardUser = useFocusManagement()

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

  // Keyboard navigation for navigation items
  const { getItemProps, activeIndex } = useKeyboardNavigation({
    itemCount: navigationItems.length,
    onItemSelect: (index) => {
      const item = navigationItems[index]
      handleNavigate(item.id)
    }
  })

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
    <>
      <nav 
        className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50"
        role="navigation"
        aria-label="Main navigation"
        id="main-navigation"
        tabIndex={-1}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center" aria-hidden="true">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">
                Muscles AI
              </span>
              <ScreenReaderOnly>
                Muscles AI Fitness Platform
              </ScreenReaderOnly>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1" role="menubar">
              {navigationItems.map((item, index) => (
                <div key={item.id} role="none" {...getItemProps(index)}>
                  <NavItem
                    item={item}
                    isActive={currentPage === item.id}
                    onClick={() => handleNavigate(item.id)}
                  />
                </div>
              ))}
            </div>

            {/* User Menu and Mobile Controls */}
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden min-h-12 min-w-12 focus:ring-2 focus:ring-blue-500"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>

              <UserMenu user={user} profile={profile} onSignOut={handleSignOut} />
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div 
              className="md:hidden border-t border-gray-200 py-3"
              id="mobile-navigation"
              role="menu"
              aria-label="Mobile navigation menu"
            >
              <div className="space-y-1" role="none">
                {navigationItems.map((item) => (
                  <div key={item.id} role="menuitem">
                    <NavItem
                      item={item}
                      isActive={currentPage === item.id}
                      onClick={() => handleNavigate(item.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* Focus indicator styles */}
      {isKeyboardUser && (
        <style jsx global>{`
          .focus-visible:focus {
            outline: 2px solid #3b82f6 !important;
            outline-offset: 2px !important;
          }
        `}</style>
      )}
    </>
  )
}

export default memo(Navigation)