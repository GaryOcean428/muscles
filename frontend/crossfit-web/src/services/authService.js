const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class AuthService {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    return data
  }

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    return data
  }

  async getCurrentUser(token) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user data')
    }

    return data.user
  }

  async updateProfile(token, profileData) {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile')
    }

    return data
  }

  async changePassword(token, passwordData) {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to change password')
    }

    return data
  }

  async requestPasswordReset(email) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to request password reset')
    }

    return data
  }

  async resetPassword(token, newPassword) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password: newPassword }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password')
    }

    return data
  }
}

export const authService = new AuthService()

