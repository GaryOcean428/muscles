import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Navigation from '@/components/Navigation'
import { PageType } from '@/types'

// Mock auth context
const mockAuthContext = {
  user: { id: '1', email: 'test@example.com' },
  profile: {
    id: '1',
    first_name: 'John',
    full_name: 'John Doe',
    email: 'test@example.com',
    subscription_plan: 'free',
    avatar_url: null
  },
  loading: false
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}))

const renderNavigation = (currentPage: PageType = 'dashboard', onNavigate = vi.fn()) => {
  return render(<Navigation currentPage={currentPage} onNavigate={onNavigate} />)
}

describe('Navigation Component', () => {
  it('renders without crashing', () => {
    renderNavigation()
    expect(screen.getByText('Muscles AI')).toBeInTheDocument()
  })

  it('highlights the current page', () => {
    renderNavigation('dashboard')
    const dashboardButton = screen.getByText('Dashboard').closest('button')
    expect(dashboardButton).toHaveClass('bg-blue-500')
  })

  it('shows upgrade badge for free plan users', () => {
    renderNavigation()
    expect(screen.getByText('Upgrade')).toBeInTheDocument()
  })

  it('displays user initials in avatar', () => {
    renderNavigation()
    expect(screen.getByText('JD')).toBeInTheDocument() // John Doe initials
  })

  it('handles navigation clicks', () => {
    const mockNavigate = vi.fn()
    renderNavigation('dashboard', mockNavigate)
    
    const workoutsButton = screen.getByText('Workouts')
    fireEvent.click(workoutsButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('workouts')
  })

  it('shows mobile menu button on small screens', () => {
    renderNavigation()
    const menuButton = screen.getByRole('button', { name: /menu/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('toggles mobile menu', () => {
    renderNavigation()
    const menuButton = screen.getByRole('button', { name: /menu/i })
    
    // Initially closed
    expect(screen.queryByText('Dashboard')).not.toBeVisible()
    
    // Open menu
    fireEvent.click(menuButton)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('shows user dropdown menu', () => {
    renderNavigation()
    const avatarButton = screen.getByRole('button', { name: /user/i })
    fireEvent.click(avatarButton)
    
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Log out')).toBeInTheDocument()
  })

  it('calls sign out when logout is clicked', async () => {
    const mockSignOut = vi.fn()
    vi.mock('@/lib/supabase', () => ({
      supabase: {
        auth: {
          signOut: mockSignOut
        }
      }
    }))
    
    renderNavigation()
    const avatarButton = screen.getByRole('button', { name: /user/i })
    fireEvent.click(avatarButton)
    
    const logoutButton = screen.getByText('Log out')
    fireEvent.click(logoutButton)
    
    expect(mockSignOut).toHaveBeenCalled()
  })
})

describe('Navigation with premium user', () => {
  beforeEach(() => {
    vi.mocked(mockAuthContext).profile.subscription_plan = 'premium'
  })

  afterEach(() => {
    vi.mocked(mockAuthContext).profile.subscription_plan = 'free'
  })

  it('does not show upgrade badge for premium users', () => {
    renderNavigation()
    expect(screen.queryByText('Upgrade')).not.toBeInTheDocument()
  })
})