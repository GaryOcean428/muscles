import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Navbar from '../layout/Navbar';

// Mock the auth context
const mockAuthContext = {
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
};

const MockAuthProvider = ({ children, value = mockAuthContext }) => (
  <AuthProvider value={value}>
    {children}
  </AuthProvider>
);

const renderWithRouter = (component, authValue) => {
  return render(
    <BrowserRouter>
      <MockAuthProvider value={authValue}>
        {component}
      </MockAuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  test('renders navbar with logo', () => {
    renderWithRouter(<Navbar />);
    
    expect(screen.getByText('FitForge')).toBeInTheDocument();
  });

  test('shows login and register links when user is not authenticated', () => {
    renderWithRouter(<Navbar />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  test('shows user menu when user is authenticated', () => {
    const authenticatedContext = {
      ...mockAuthContext,
      user: { id: 1, email: 'test@example.com', first_name: 'Test' }
    };

    renderWithRouter(<Navbar />, authenticatedContext);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Workouts')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('calls logout function when logout is clicked', () => {
    const mockLogout = jest.fn();
    const authenticatedContext = {
      ...mockAuthContext,
      user: { id: 1, email: 'test@example.com', first_name: 'Test' },
      logout: mockLogout
    };

    renderWithRouter(<Navbar />, authenticatedContext);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test('toggles mobile menu when hamburger is clicked', () => {
    renderWithRouter(<Navbar />);
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(hamburgerButton);
    
    // Check if mobile menu is visible (this would depend on your implementation)
    // You might need to check for specific classes or aria attributes
  });

  test('highlights active navigation link', () => {
    const authenticatedContext = {
      ...mockAuthContext,
      user: { id: 1, email: 'test@example.com', first_name: 'Test' }
    };

    renderWithRouter(<Navbar />, authenticatedContext);
    
    // This test would depend on how you implement active link highlighting
    // You might check for specific CSS classes or aria-current attributes
  });
});

