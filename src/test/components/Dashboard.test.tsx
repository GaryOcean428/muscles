import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import Dashboard from '@/components/Dashboard'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock auth context
const mockAuthContext = {
  user: { id: '1', email: 'test@example.com' },
  profile: {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    fitness_level: 'intermediate',
    body_type: 'mesomorph',
    subscription_plan: 'premium',
    total_workouts_completed: 15,
    fitness_goals: ['weight_loss', 'muscle_gain'],
    preferred_duration: 45,
    workout_frequency: 4,
    height_cm: 180,
    weight_kg: 75
  },
  loading: false
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

const renderDashboard = (onNavigate = vi.fn()) => {
  return render(
    <AuthProvider>
      <Dashboard onNavigate={onNavigate} />
    </AuthProvider>
  )
}

describe('Dashboard Component', () => {
  it('renders without crashing', () => {
    renderDashboard()
    expect(screen.getByText(/Good morning|Good afternoon|Good evening/)).toBeInTheDocument()
  })

  it('displays user greeting with first name', () => {
    renderDashboard()
    expect(screen.getByText(/John!/)).toBeInTheDocument()
  })

  it('shows subscription plan badge', () => {
    renderDashboard()
    expect(screen.getByText('PREMIUM Plan')).toBeInTheDocument()
  })

  it('displays fitness stats correctly', () => {
    renderDashboard()
    expect(screen.getByText('15')).toBeInTheDocument() // workouts completed
    expect(screen.getByText('2')).toBeInTheDocument() // active goals
    expect(screen.getByText('45 min')).toBeInTheDocument() // preferred duration
    expect(screen.getByText('4')).toBeInTheDocument() // weekly frequency
  })

  it('shows fitness level progress', () => {
    renderDashboard()
    expect(screen.getByText('Current level: Intermediate')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument() // intermediate = 50%
  })

  it('displays profile information', () => {
    renderDashboard()
    expect(screen.getByText('Mesomorph')).toBeInTheDocument()
    expect(screen.getByText('180cm')).toBeInTheDocument()
    expect(screen.getByText('75kg')).toBeInTheDocument()
  })

  it('handles navigation to FitCraft coach', async () => {
    const mockNavigate = vi.fn()
    renderDashboard(mockNavigate)
    
    const fitcraftCard = screen.getByText('FitCraft Coach').closest('[role="button"]') as HTMLElement
    fireEvent.click(fitcraftCard)
    
    expect(mockNavigate).toHaveBeenCalledWith('fitcraft')
  })

  it('handles navigation to workout generator', async () => {
    const mockNavigate = vi.fn()
    renderDashboard(mockNavigate)
    
    const workoutCard = screen.getByText('Generate Workout').closest('[role="button"]') as HTMLElement
    fireEvent.click(workoutCard)
    
    expect(mockNavigate).toHaveBeenCalledWith('workouts')
  })

  it('handles navigation to calendar', async () => {
    const mockNavigate = vi.fn()
    renderDashboard(mockNavigate)
    
    const calendarCard = screen.getByText('Schedule Workouts').closest('[role="button"]') as HTMLElement
    fireEvent.click(calendarCard)
    
    expect(mockNavigate).toHaveBeenCalledWith('calendar')
  })

  it('shows fitness goals as badges', () => {
    renderDashboard()
    expect(screen.getByText('weight_loss')).toBeInTheDocument()
    expect(screen.getByText('muscle_gain')).toBeInTheDocument()
  })
})

describe('Dashboard with loading state', () => {
  beforeEach(() => {
    vi.mocked(mockAuthContext).loading = true
  })

  afterEach(() => {
    vi.mocked(mockAuthContext).loading = false
  })

  it('shows skeleton loader when loading', () => {
    renderDashboard()
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument()
  })
})

describe('Dashboard without user data', () => {
  beforeEach(() => {
    vi.mocked(mockAuthContext).user = null
    vi.mocked(mockAuthContext).profile = null
  })

  afterEach(() => {
    vi.mocked(mockAuthContext).user = { id: '1', email: 'test@example.com' }
    vi.mocked(mockAuthContext).profile = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      fitness_level: 'intermediate',
      body_type: 'mesomorph',
      subscription_plan: 'premium',
      total_workouts_completed: 15,
      fitness_goals: ['weight_loss', 'muscle_gain'],
      preferred_duration: 45,
      workout_frequency: 4,
      height_cm: 180,
      weight_kg: 75
    }
  })

  it('shows skeleton when user or profile is missing', () => {
    renderDashboard()
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument()
  })
})