import { apiClient } from './apiClient';
import { CreateOrderRequest, Order, OrderStatus, ShippingMethod } from '../types';

async function getOrders(path: string): Promise<Order[]> {
  const orders: Order[] = [];
  for (let page = 0; ; page++) {
    const { data } = await apiClient.get<{ content: Order[]; last: boolean }>(path, { params: { page, size: 100 } });
    orders.push(...data.content);
    if (data.last) return orders;
  }
}

export const orderService = {
  async quote(items: { bookId: number; quantity: number }[], couponCode?: string, shippingMethod: ShippingMethod = 'STANDARD') {
    return (await apiClient.post<{ subtotal: number; shippingFee: number; discountAmount: number; totalAmount: number }>(
      '/orders/quote', { items, couponCode, shippingMethod },
    )).data;
  },
  async getAll(): Promise<Order[]> {
    return getOrders('/orders');
  },

  async getAllAdmin(): Promise<Order[]> {
    return getOrders('/orders/admin');
  },

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const res = await apiClient.patch<Order>(`/orders/admin/${id}/status`, null, {
      params: { orderStatus: status },
    });
    return res.data;
  },

  async lookup(trackingCode: string): Promise<Pick<Order, 'trackingCode' | 'status' | 'totalAmount' | 'createdAt'>> {
    const res = await apiClient.get('/orders/lookup', { params: { code: trackingCode } });
    return res.data;
  },

  async create(data: CreateOrderRequest): Promise<Order> {
    const res = await apiClient.post<Order>('/orders', data);
    return res.data;
  },
};
