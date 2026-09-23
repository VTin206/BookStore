import { apiClient } from './apiClient';
import { Book, BookRequest } from '../types';

export const bookService = {
  async getAll(search?: string): Promise<Book[]> {
    const params = search ? { search } : {};
    const res = await apiClient.get<Book[]>('/books', { params });
    return res.data;
  },

  async getById(id: number | string): Promise<Book> {
    const res = await apiClient.get<Book>(`/books/${id}`);
    return res.data;
  },

  async create(data: BookRequest): Promise<Book> {
    const res = await apiClient.post<Book>('/books', data);
    return res.data;
  },

  async update(id: number | string, data: BookRequest): Promise<Book> {
    const res = await apiClient.put<Book>(`/books/${id}`, data);
    return res.data;
  },

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`/books/${id}`);
  },
};
