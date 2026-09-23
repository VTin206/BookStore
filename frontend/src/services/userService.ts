import { apiClient } from './apiClient';
import { User } from '../types';

export const userService = {
  async getAll(): Promise<User[]> {
    const res = await apiClient.get<User[]>('/users');
    return res.data;
  },
};
