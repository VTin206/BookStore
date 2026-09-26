import { apiClient } from './apiClient';
import { Author } from '../types';

export interface AuthorRequest {
  name: string;
  biography?: string;
}

export const authorService = {
  async getAll(): Promise<Author[]> {
    const res = await apiClient.get<Author[]>('/authors');
    return res.data;
  },

  async create(data: AuthorRequest): Promise<Author> {
    const res = await apiClient.post<Author>('/authors', data);
    return res.data;
  },

  async update(id: number, data: AuthorRequest): Promise<Author> {
    const res = await apiClient.put<Author>(`/authors/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/authors/${id}`);
  },
};