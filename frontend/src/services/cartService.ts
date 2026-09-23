import { apiClient } from './apiClient';
import { Cart, CartItem, Book } from '../types';

const LOCAL_CART_KEY = 'bookstore_guest_cart';

export const cartService = {
  // Local Cart Helpers (For guest or offline support)
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
      // storage full or disabled
    }
  },

  clearLocalCart(): void {
    localStorage.removeItem(LOCAL_CART_KEY);
  },

  // Remote Cart API
  async getRemoteCart(): Promise<Cart> {
    const res = await apiClient.get<Cart>('/cart');
    return res.data;
  },

  async addToRemoteCart(bookId: number, quantity: number): Promise<Cart> {
    const res = await apiClient.post<Cart>('/cart/items', { bookId, quantity });
    return res.data;
  },

  async removeFromRemoteCart(cartItemId: number | string): Promise<void> {
    await apiClient.delete(`/cart/items/${cartItemId}`);
  },
};
