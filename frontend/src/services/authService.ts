import { apiClient } from './apiClient';
import { AuthResponse } from '../types';

export interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_info');
  },
};
