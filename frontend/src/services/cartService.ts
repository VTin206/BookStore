import { apiClient } from './apiClient';
import { Cart, CartItem } from '../types';

const LOCAL_CART_KEY = 'bookstore_guest_cart';
const CART_REQUEST_TIMEOUT_MS = 10000;

const isCartItems = (items: unknown): items is CartItem[] =>
  Array.isArray(items) && items.every((item) =>
    item !== null && typeof item === 'object' &&
    item.book !== null && typeof item.book === 'object' &&
    typeof item.book.id === 'number' && typeof item.book.price === 'number' &&
    typeof item.quantity === 'number'
  );

const requireCart = (cart: Cart): Cart => {
  if (!cart || !isCartItems(cart.items)) {
    throw new Error('Invalid cart response');
  }
  return cart;
};

export const cartService = {
  getLocalCart(): CartItem[] {
    try {
      const data = localStorage.getItem(LOCAL_CART_KEY);
      const items: unknown = data ? JSON.parse(data) : [];
      return isCartItems(items) ? items : [];
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
    const res = await apiClient.get<Cart>('/cart', { timeout: CART_REQUEST_TIMEOUT_MS });
    return requireCart(res.data);
  },

  async addToRemoteCart(bookId: number, quantity: number): Promise<Cart> {
    const res = await apiClient.post<Cart>('/cart/items', { bookId, quantity }, { timeout: CART_REQUEST_TIMEOUT_MS });
    return requireCart(res.data);
  },

  async updateRemoteCart(cartItemId: number, quantity: number): Promise<Cart> {
    const res = await apiClient.patch<Cart>(`/cart/items/${cartItemId}`, { quantity }, { timeout: CART_REQUEST_TIMEOUT_MS });
    return requireCart(res.data);
  },

  async removeFromRemoteCart(cartItemId: number): Promise<void> {
    await apiClient.delete(`/cart/items/${cartItemId}`);
  },

  async clearRemoteCart(): Promise<void> {
    await apiClient.delete('/cart');
  },
};
