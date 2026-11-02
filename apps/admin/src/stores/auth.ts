import { create } from 'zustand';
import { fetchApi } from '../services/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  storeId: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Optimistic set
      if (savedUser) {
        set({ user: JSON.parse(savedUser), isAuthenticated: true });
      }

      // Verify with backend
      const user = await fetchApi('/auth/me');
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
