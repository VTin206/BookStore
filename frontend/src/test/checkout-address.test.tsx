import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { getAllProvincesSorted, getDistrictsByProvinceId } from 'vietnam-divisions-js/provinces';
import { getCommunesByDistrictId } from 'vietnam-divisions-js/districts';

vi.mock('../context/CartContext', () => ({ useCart: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../context/ToastContext', () => ({ useToast: vi.fn() }));
vi.mock('../services/orderService', () => ({ orderService: { create: vi.fn() } }));
vi.mock('vietnam-divisions-js/provinces', () => ({
  getAllProvincesSorted: vi.fn(),
  getDistrictsByProvinceId: vi.fn(),
}));
vi.mock('vietnam-divisions-js/districts', () => ({
  getCommunesByDistrictId: vi.fn(),
}));

describe('Checkout address', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCart).mockReturnValue({
      items: [{ id: 1, book: { id: 3, title: 'Book', author: 'Author', price: 100000, stock: 5 }, quantity: 1 }],
      totalAmount: 100000,
      clearCart: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useCart>);
    vi.mocked(useAuth).mockReturnValue({ username: 'alice', isAuthenticated: true } as ReturnType<typeof useAuth>);
    vi.mocked(useToast).mockReturnValue({ error: vi.fn(), success: vi.fn() } as unknown as ReturnType<typeof useToast>);
    vi.mocked(getAllProvincesSorted).mockResolvedValue([
      { idProvince: '01', name: 'Thành phố Hà Nội' },
      { idProvince: '79', name: 'Thành phố Hồ Chí Minh' },
    ]);
    vi.mocked(getDistrictsByProvinceId).mockImplementation(async (provinceId) =>
      provinceId === '01'
        ? [{ idProvince: '01', idDistrict: '001', name: 'Quận Ba Đình' }]
        : [{ idProvince: '79', idDistrict: '760', name: 'Quận 1' }]
    );
    vi.mocked(getCommunesByDistrictId).mockImplementation(async (districtId) =>
      districtId === '001'
        ? [{ idDistrict: '001', idCommune: '00001', name: 'Phường Phúc Xá' }]
        : [{ idDistrict: '760', idCommune: '26734', name: 'Phường Bến Nghé' }]
    );
    vi.mocked(orderService.create).mockResolvedValue({ id: 42 } as Awaited<ReturnType<typeof orderService.create>>);
  });

  it('resets dependent selections and sends the complete shipping address', async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);

    const province = await screen.findByLabelText('Tỉnh / thành phố');
    const district = screen.getByLabelText('Quận / huyện');
    const commune = screen.getByLabelText('Phường / xã / thị trấn');

    fireEvent.change(province, { target: { value: '01' } });
    await screen.findByRole('option', { name: 'Quận Ba Đình' });
    fireEvent.change(district, { target: { value: '001' } });
    await screen.findByRole('option', { name: 'Phường Phúc Xá' });
    fireEvent.change(commune, { target: { value: '00001' } });

    fireEvent.change(province, { target: { value: '79' } });
    await waitFor(() => {
      expect(district).toHaveValue('');
      expect(commune).toHaveValue('');
    });

    await screen.findByRole('option', { name: 'Quận 1' });
    fireEvent.change(district, { target: { value: '760' } });
    await screen.findByRole('option', { name: 'Phường Bến Nghé' });
    fireEvent.change(commune, { target: { value: '26734' } });
    fireEvent.change(screen.getByLabelText(/Email nhận thông báo/), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByLabelText(/Số điện thoại liên hệ/), { target: { value: '0901234567' } });
    fireEvent.change(screen.getByLabelText(/Địa chỉ chi tiết/), { target: { value: '12 Đường A' } });

    fireEvent.click(screen.getByRole('button', { name: /Đặt hàng ngay/ }));
    await waitFor(() => expect(orderService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        shippingAddress: '12 Đường A, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
      })
    ));
  });
});
