import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth.types';

export const AuthService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({ email: data.email }));
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({ email: data.email }));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined') {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          localStorage.removeItem('user');
          return null;
        }
      }
    }
    return null;
  }
};
