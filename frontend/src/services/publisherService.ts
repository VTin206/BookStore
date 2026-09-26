import { apiClient } from './apiClient';
import { Publisher } from '../types';

export interface PublisherRequest {
  name: string;
  address?: string;
  website?: string;
}

export const publisherService = {
  async getAll(): Promise<Publisher[]> {
    const res = await apiClient.get<Publisher[]>('/publishers');
    return res.data;
  },

  async create(data: PublisherRequest): Promise<Publisher> {
    const res = await apiClient.post<Publisher>('/publishers', data);
    return res.data;
  },

  async update(id: number, data: PublisherRequest): Promise<Publisher> {
    const res = await apiClient.put<Publisher>(`/publishers/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/publishers/${id}`);
  },
};