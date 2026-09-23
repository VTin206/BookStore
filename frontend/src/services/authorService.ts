import { apiClient } from './apiClient';
import { Author } from '../types';

export const authorService = {
  async getAll(): Promise<Author[]> {
    const res = await apiClient.get<Author[]>('/authors');
    return res.data;
  },

  async create(data: { name: string; biography?: string }): Promise<Author> {
    const res = await apiClient.post<Author>('/authors', data);
    return res.data;
  },
};
