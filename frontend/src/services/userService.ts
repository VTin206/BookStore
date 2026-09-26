import { apiClient } from './apiClient';
import { User, WishlistItem } from '../types';

export interface ProfileUpdateRequest {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  async getAll(): Promise<User[]> {
    const res = await apiClient.get<User[]>('/users');
    return res.data;
  },

  async updateRole(id: number, role: 'ADMIN' | 'CUSTOMER'): Promise<User> {
    const res = await apiClient.patch<User>('/users/' + id + '/role', null, { params: { value: role } });
    return res.data;
  },
  async getMe(): Promise<User> {
    const res = await apiClient.get<User>('/users/me');
    return res.data;
  },

  async updateMe(data: ProfileUpdateRequest): Promise<User> {
    const res = await apiClient.put<User>('/users/me', data);
    return res.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.put('/users/me/password', data);
  },

  async getWishlist(): Promise<WishlistItem[]> {
    const res = await apiClient.get<WishlistItem[]>('/users/me/wishlist');
    return res.data;
  },

  async addToWishlist(bookId: number): Promise<WishlistItem> {
    const res = await apiClient.post<WishlistItem>(`/users/me/wishlist/${bookId}`);
    return res.data;
  },

  async removeFromWishlist(bookId: number): Promise<void> {
    await apiClient.delete(`/users/me/wishlist/${bookId}`);
  },
};
