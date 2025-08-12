import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Update this for production

class AuthService {
  async login(email: string, password: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });

    return response.data;
  }

  async register(userData: any) {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);

    return response.data;
  }

  async getCurrentUser(token: string) {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.user;
  }

  async updateProfile(token: string, profileData: any) {
    const response = await axios.put(`${API_BASE_URL}/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async changePassword(token: string, passwordData: any) {
    const response = await axios.post(`${API_BASE_URL}/auth/change-password`, passwordData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async requestPasswordReset(email: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
      email,
    });

    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
      token,
      password: newPassword,
    });

    return response.data;
  }
}

export const authService = new AuthService();

