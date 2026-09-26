import { apiClient } from './apiClient';
import { CreateOrderRequest, Order, OrderStatus } from '../types';

export const orderService = {
  async getAll(): Promise<Order[]> {
    const res = await apiClient.get<Order[]>('/orders');
    return res.data;
  },

  async getAllAdmin(): Promise<Order[]> {
    const res = await apiClient.get<Order[]>('/orders/admin');
    return res.data;
  },

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const res = await apiClient.patch<Order>(`/orders/admin/${id}/status`, null, {
      params: { value: status },
    });
    return res.data;
  },

  async create(data: CreateOrderRequest): Promise<Order> {
    const res = await apiClient.post<Order>('/orders', data);
    return res.data;
  },
};
