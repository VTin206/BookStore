import { apiClient } from './apiClient';
import { Publisher } from '../types';

export const publisherService = {
  async getAll(): Promise<Publisher[]> {
    const res = await apiClient.get<Publisher[]>('/publishers');
    return res.data;
  },

  async create(data: { name: string; address?: string; website?: string }): Promise<Publisher> {
    const res = await apiClient.post<Publisher>('/publishers', data);
    return res.data;
  },
};
