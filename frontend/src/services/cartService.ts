import { apiClient } from './apiClient';
import { Cart, CartItem } from '../types';

const LOCAL_CART_KEY = 'bookstore_guest_cart';

export const cartService = {
  getLocalCart(): CartItem[] {
    try {
      const data = localStorage.getItem(LOCAL_CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setLocalCart(items: CartItem[]): void {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    } catch {
      // Storage can be disabled or full.
    }
  },

  clearLocalCart(): void {
    localStorage.removeItem(LOCAL_CART_KEY);
  },

  async getRemoteCart(): Promise<Cart> {
    const res = await apiClient.get<Cart>('/cart');
    return res.data;
  },

  async addToRemoteCart(bookId: number, quantity: number): Promise<Cart> {
    const res = await apiClient.post<Cart>('/cart/items', { bookId, quantity });
    return res.data;
  },

  async updateRemoteCart(cartItemId: number, quantity: number): Promise<Cart> {
    const res = await apiClient.patch<Cart>(`/cart/items/${cartItemId}`, { quantity });
    return res.data;
  },

  async removeFromRemoteCart(cartItemId: number): Promise<void> {
    await apiClient.delete(`/cart/items/${cartItemId}`);
  },
};
