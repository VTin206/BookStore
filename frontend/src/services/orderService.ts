import { apiClient } from './apiClient';
import { Order, CreateOrderRequest } from '../types';

export const orderService = {
  async getAll(): Promise<Order[]> {
    const res = await apiClient.get<Order[]>('/orders');
    return res.data;
  },

  async create(data: CreateOrderRequest): Promise<Order> {
    const res = await apiClient.post<Order>('/orders', data);
    return res.data;
  },
};
