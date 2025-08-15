import { authService } from '../authService';

// Mock fetch globally
global.fetch = jest.fn();

describe('AuthService', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  describe('login', () => {
    test('successful login stores token and returns user data', async () => {
      const mockResponse = {
        success: true,
        access_token: 'mock-token',
        user: { id: 1, email: 'test@example.com', first_name: 'Test' }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(result).toEqual(mockResponse);
    });

    test('failed login throws error', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid credentials'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockResponse
      });

      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');

      expect(localStorage.getItem('token')).toBeNull();
    });

    test('network error throws error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(authService.login('test@example.com', 'password123'))
        .rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
    test('successful registration stores token and returns user data', async () => {
      const mockResponse = {
        success: true,
        access_token: 'mock-token',
        user: { id: 1, email: 'new@example.com', first_name: 'New' }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const userData = {
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User'
      };

      const result = await authService.register(userData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(result).toEqual(mockResponse);
    });

    test('failed registration throws error', async () => {
      const mockResponse = {
        success: false,
        error: 'Email already exists'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockResponse
      });

      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User'
      };

      await expect(authService.register(userData))
        .rejects.toThrow('Email already exists');

      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('logout', () => {
    test('logout removes token from localStorage', () => {
      localStorage.setItem('token', 'mock-token');
      
      authService.logout();
      
      expect(localStorage.getItem('token')).toBeNull();
    });

    test('logout makes API call when token exists', async () => {
      localStorage.setItem('token', 'mock-token');
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await authService.logout();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      });
    });
  });

  describe('getCurrentUser', () => {
    test('returns user data when token is valid', async () => {
      localStorage.setItem('token', 'mock-token');
      
      const mockResponse = {
        success: true,
        user: { id: 1, email: 'test@example.com', first_name: 'Test' }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await authService.getCurrentUser();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      });

      expect(result).toEqual(mockResponse.user);
    });

    test('returns null when no token exists', async () => {
      const result = await authService.getCurrentUser();
      
      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    test('returns null when token is invalid', async () => {
      localStorage.setItem('token', 'invalid-token');
      
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('getAuthHeaders', () => {
    test('returns headers with token when token exists', () => {
      localStorage.setItem('token', 'mock-token');
      
      const headers = authService.getAuthHeaders();
      
      expect(headers).toEqual({
        'Authorization': 'Bearer mock-token',
        'Content-Type': 'application/json'
      });
    });

    test('returns headers without token when no token exists', () => {
      const headers = authService.getAuthHeaders();
      
      expect(headers).toEqual({
        'Content-Type': 'application/json'
      });
    });
  });

  describe('isAuthenticated', () => {
    test('returns true when token exists', () => {
      localStorage.setItem('token', 'mock-token');
      
      expect(authService.isAuthenticated()).toBe(true);
    });

    test('returns false when no token exists', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});

