import { apiClient } from './apiClient';
import { Category } from '../types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await apiClient.get<Category[]>('/categories');
    return res.data;
  },

  async create(name: string): Promise<Category> {
    const res = await apiClient.post<Category>('/categories', { name });
    return res.data;
  },
};
