import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { AdminBooksPage } from '../pages/admin/AdminBooksPage';
import { bookService } from '../services/bookService';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('../context/ToastContext', () => ({ useToast: () => toast }));
vi.mock('../services/bookService', () => ({ bookService: { getAll: vi.fn(), setActive: vi.fn() } }));
vi.mock('../services/categoryService', () => ({ categoryService: { getAll: vi.fn().mockResolvedValue([]) } }));
vi.mock('../services/authorService', () => ({ authorService: { getAll: vi.fn().mockResolvedValue([]) } }));
vi.mock('../services/publisherService', () => ({ publisherService: { getAll: vi.fn().mockResolvedValue([]) } }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(bookService.getAll).mockResolvedValue([
    { id: 1, title: 'Test Book', author: 'Author', price: 100, stock: 2, active: true },
  ]);
  vi.mocked(bookService.setActive).mockResolvedValue({ id: 1, title: 'Test Book', author: 'Author', price: 100, stock: 2, active: false });
});

it('stops selling a book from the admin page', async () => {
  render(<AdminBooksPage />);
  const button = await screen.findByRole('button', { name: /ng.*b.*n/i });
  fireEvent.click(button);
  await waitFor(() => expect(bookService.setActive).toHaveBeenCalledWith(1, false));
  expect(toast.success).toHaveBeenCalled();
  expect(toast.error).not.toHaveBeenCalled();
});

it('shows a backend reason when status update fails', async () => {
  vi.mocked(bookService.setActive).mockRejectedValue({ response: { data: { message: 'Kh?ng th? c?p nh?t tr?ng th?i.' } } });
  render(<AdminBooksPage />);
  fireEvent.click(await screen.findByRole('button', { name: /ng.*b.*n/i }));
  await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
});

