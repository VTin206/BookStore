import { apiClient } from './apiClient';
import { Category } from '../types';

export interface CategoryRequest {
  name: string;
  description?: string;
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await apiClient.get<Category[]>('/categories');
    return res.data;
  },

  async create(data: CategoryRequest): Promise<Category> {
    const res = await apiClient.post<Category>('/categories', data);
    return res.data;
  },

  async update(id: number, data: CategoryRequest): Promise<Category> {
    const res = await apiClient.put<Category>(`/categories/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};