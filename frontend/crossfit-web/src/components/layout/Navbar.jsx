import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
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
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Dumbbell, 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  BarChart3, 
  Zap,
  Calendar,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      description: 'View your fitness progress and stats'
    },
    {
      title: 'Workouts',
      href: '/workouts',
      icon: Dumbbell,
      description: 'Browse and manage your workouts'
    },
    {
      title: 'Generate',
      href: '/generate',
      icon: Zap,
      description: 'Create AI-powered personalized workouts'
    }
  ]

  const NavLink = ({ href, children, className, ...props }) => (
    <Link
      to={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        location.pathname === href 
          ? "text-primary" 
          : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/logo-horizontal.png" 
            alt="Muscles" 
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <NavigationMenu className="hidden md:flex mx-6">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Workouts</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          to="/generate"
                        >
                          <Zap className="h-6 w-6" />
                          <div className="mb-2 mt-4 text-lg font-medium">
                            AI Workout Generator
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Create personalized workouts powered by artificial intelligence
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    {navigationItems.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center space-x-2">
                              <item.icon className="h-4 w-4" />
                              <div className="text-sm font-medium leading-none">
                                {item.title}
                              </div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url} alt={user?.first_name} />
                    <AvatarFallback>
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="md:hidden"
              size="icon"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 mt-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 pb-4 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar_url} alt={user?.first_name} />
                      <AvatarFallback>
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center space-x-2 text-sm font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                  
                  <div className="border-t pt-4 space-y-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                      className="flex items-center space-x-2 text-sm w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

export default Navbar

