import { apiClient } from './apiClient';
import { PageResponse, Review } from '../types';

export const reviewService = {
  async getByBook(bookId: number | string): Promise<Review[]> {
    try {
      const res = await apiClient.get<Review[]>(`/reviews/book/${bookId}`);
      return res.data;
    } catch {
      return [];
    }
  },

  async getPage(bookId: number | string, page = 0, size = 10): Promise<PageResponse<Review>> {
    const res = await apiClient.get<PageResponse<Review>>(`/reviews/book/${bookId}/page`, {
      params: { page, size },
    });
    return res.data;
  },


  async canReview(bookId: number | string): Promise<boolean> {
    if (!localStorage.getItem('token')) {
      return false;
    }
    try {
      const res = await apiClient.get<boolean>(`/reviews/book/${bookId}/can-review`);
      return res.data;
    } catch {
      return false;
    }
  },

  async create(data: { bookId: number; rating: number; comment?: string }): Promise<Review> {
    const res = await apiClient.post<Review>('/reviews', data);
    return res.data;
  },
};
