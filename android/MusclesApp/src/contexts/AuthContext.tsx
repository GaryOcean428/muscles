import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authService} from '../services/authService';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  fitness_level: string;
  body_type: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  register: (userData: any) => Promise<{success: boolean; error?: string}>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        if (savedToken) {
          const userData = await authService.getCurrentUser(savedToken);
          setUser(userData);
          setToken(savedToken);
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
        await AsyncStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        return {success: true};
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {success: false, error: error.message};
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        return {success: true};
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return {success: false, error: error.message};
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? {...prev, ...userData} : null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

