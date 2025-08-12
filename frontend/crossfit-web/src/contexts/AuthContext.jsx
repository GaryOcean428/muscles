import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { toast } from 'sonner'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          const userData = await authService.getCurrentUser(savedToken)
          setUser(userData)
          setToken(savedToken)
        } catch (error) {
          console.error('Failed to get current user:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await authService.login(email, password)
      
      if (response.token) {
        localStorage.setItem('token', response.token)
        setToken(response.token)
        setUser(response.user)
        toast.success('Login successful!')
        return { success: true }
      } else {
        throw new Error('No token received')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authService.register(userData)
      
      if (response.token) {
        localStorage.setItem('token', response.token)
        setToken(response.token)
        setUser(response.user)
        toast.success('Registration successful!')
        return { success: true }
      } else {
        throw new Error('No token received')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Registration failed')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

