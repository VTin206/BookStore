import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CartProvider, useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cartService } from '../services/cartService';
import { Book, CartItem } from '../types';

vi.mock('../services/cartService', () => ({
  cartService: {
    getLocalCart: vi.fn(),
    setLocalCart: vi.fn(),
    clearLocalCart: vi.fn(),
    getRemoteCart: vi.fn(),
    addToRemoteCart: vi.fn(),
    updateRemoteCart: vi.fn(),
    removeFromRemoteCart: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: vi.fn(),
}));

const book: Book = {
  id: 1,
  title: 'Book',
  author: 'Author',
  price: 10,
  stock: 5,
};

const CartProbe: React.FC = () => {
  const cart = useCart();

  return (
    <div>
      <span data-testid="count">{cart.itemCount}</span>
      <span data-testid="total">{cart.totalAmount}</span>
      <button onClick={() => void cart.addToCart(book, 2)}>add</button>
      <button onClick={() => void cart.updateQuantity('local-1', 20)}>update</button>
      <button onClick={() => void cart.updateQuantity(4, 3)}>remote-update</button>
      <button onClick={() => void cart.removeFromCart('local-1')}>remove</button>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as unknown as ReturnType<typeof useAuth>);
    vi.mocked(useToast).mockReturnValue({
      success: vi.fn(),
      error: vi.fn(),
    } as unknown as ReturnType<typeof useToast>);
    vi.mocked(cartService.getLocalCart).mockReturnValue([
      { id: 'local-1', book, quantity: 2 },
    ]);
    vi.mocked(cartService.getRemoteCart).mockResolvedValue({ items: [] });
  });

  it('calculates count and total, caps local quantity by stock, and removes items', async () => {
    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>,
    );

    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('20');

    fireEvent.click(screen.getByText('update'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('5'));
    expect(screen.getByTestId('total')).toHaveTextContent('50');

    fireEvent.click(screen.getByText('remove'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('0'));
    expect(cartService.setLocalCart).toHaveBeenCalled();
  });

  it('loads remote cart and updates numeric item ids for authenticated users', async () => {
    const remoteItem: CartItem = { id: 4, book, quantity: 1 };
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as unknown as ReturnType<typeof useAuth>);
    vi.mocked(cartService.getRemoteCart).mockResolvedValue({ items: [remoteItem] });
    vi.mocked(cartService.updateRemoteCart).mockResolvedValue({
      items: [{ ...remoteItem, quantity: 3 }],
    });

    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
    expect(cartService.getRemoteCart).toHaveBeenCalledOnce();

    // The probe uses a local id; this assertion verifies remote loading and persistence.
    expect(cartService.setLocalCart).toHaveBeenCalledWith([remoteItem]);

    fireEvent.click(screen.getByText('remote-update'));
    await waitFor(() => expect(cartService.updateRemoteCart).toHaveBeenCalledWith(4, 3));
  });
});