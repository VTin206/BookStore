import { apiClient } from './apiClient';
import { Voucher, VoucherRequest } from '../types';
export const voucherService = {
  async getAll(): Promise<Voucher[]> { return (await apiClient.get<Voucher[]>('/vouchers')).data; },
  async create(data: VoucherRequest): Promise<Voucher> { return (await apiClient.post<Voucher>('/vouchers', data)).data; },
  async update(id: number, data: VoucherRequest): Promise<Voucher> { return (await apiClient.put<Voucher>(`/vouchers/${id}`, data)).data; },
  async delete(id: number): Promise<void> { await apiClient.delete(`/vouchers/${id}`); },
  async validate(code: string, subtotal: number): Promise<number> { return (await apiClient.get<number>(`/vouchers/validate`, { params: { code, subtotal } })).data; },
};