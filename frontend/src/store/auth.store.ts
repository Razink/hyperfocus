import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login({ email, password });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Erreur de connexion';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.register({ name, email, password });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Erreur lors de l\'inscription';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }

    try {
      const user = await authService.getMe();
      set({ user, token });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
    }
  },
}));
