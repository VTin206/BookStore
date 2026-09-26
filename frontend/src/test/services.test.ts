import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../services/apiClient';
import { authService } from '../services/authService';
import { bookService } from '../services/bookService';
import { categoryService } from '../services/categoryService';
import { orderService } from '../services/orderService';
import { userService } from '../services/userService';

vi.mock('../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('API services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers and logs in through auth endpoints', async () => {
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({ data: { token: 'register-token', username: 'alice', role: 'CUSTOMER' } })
      .mockResolvedValueOnce({ data: { token: 'login-token', username: 'alice', role: 'CUSTOMER' } });

    await expect(
      authService.register({
        username: 'alice',
        password: 'secret123',
        fullName: 'Alice',
        email: 'alice@example.com',
      }),
    ).resolves.toEqual({ token: 'register-token', username: 'alice', role: 'CUSTOMER' });
    await expect(authService.login({ username: 'alice', password: 'secret123' })).resolves.toEqual({
      token: 'login-token',
      username: 'alice',
      role: 'CUSTOMER',
    });
    expect(apiClient.post).toHaveBeenNthCalledWith(1, '/auth/register', expect.objectContaining({ username: 'alice' }));
    expect(apiClient.post).toHaveBeenNthCalledWith(2, '/auth/login', { username: 'alice', password: 'secret123' });
  });

  it('loads books with an optional search parameter', async () => {
    const books = [{ id: 1, title: 'Book', author: 'Author', price: 100, stock: 3 }];
    vi.mocked(apiClient.get).mockResolvedValue({ data: books });

    await expect(bookService.getAll('  java  ')).resolves.toEqual(books);
    expect(apiClient.get).toHaveBeenCalledWith('/books', { params: { search: '  java  ' } });
  });

  it('sends full book metadata when creating a book', async () => {
    const payload = {
      title: 'Book',
      author: 'Author',
      price: 100,
      stock: 3,
      categoryId: 1,
      authorId: 2,
      publisherId: 3,
      isbn: '123',
      description: 'Description',
      imageUrl: 'https://image',
      publicationDate: '2024-01-01',
    };
    vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 1, ...payload } });

    await bookService.create(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/books', payload);
  });

  it('supports category update and delete', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { id: 4, name: 'Fiction' } });
    vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined });

    await categoryService.update(4, { name: 'Fiction', description: 'Novels' });
    await categoryService.delete(4);

    expect(apiClient.put).toHaveBeenCalledWith('/categories/4', {
      name: 'Fiction',
      description: 'Novels',
    });
    expect(apiClient.delete).toHaveBeenCalledWith('/categories/4');
  });

  it('loads admin orders and updates order status', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [{ id: 9, status: 'PENDING' }] });
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { id: 9, status: 'SHIPPING' } });

    await expect(orderService.getAllAdmin()).resolves.toEqual([{ id: 9, status: 'PENDING' }]);
    await expect(orderService.updateStatus(9, 'SHIPPING')).resolves.toEqual({ id: 9, status: 'SHIPPING' });

    expect(apiClient.get).toHaveBeenCalledWith('/orders/admin');
    expect(apiClient.patch).toHaveBeenCalledWith('/orders/admin/9/status', null, {
      params: { value: 'SHIPPING' },
    });
  });

  it('updates a user role through the admin endpoint', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { id: 4, role: 'ADMIN' } });

    await userService.updateRole(4, 'ADMIN');

    expect(apiClient.patch).toHaveBeenCalledWith('/users/4/role', null, {
      params: { value: 'ADMIN' },
    });
  });
});