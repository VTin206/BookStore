import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

const AuthProbe: React.FC = () => {
  const auth = useAuth();

  return (
    <div>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="admin">{String(auth.isAdmin)}</span>
      <span data-testid="username">{auth.username || ''}</span>
      <button
        onClick={() =>
          void auth.login({ username: 'alice', password: 'secret123' })
        }
      >
        login
      </button>
      <button
        onClick={() =>
          void auth.register({
            username: 'new-user',
            password: 'secret123',
            fullName: 'New User',
            email: 'new@example.com',
          })
        }
      >
        register
      </button>
      <button onClick={auth.logout}>logout</button>
    </div>
  );
};

const createTestToken = () => {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${payload}.signature`;
};

describe('AuthContext', () => {
  it('discards an expired token immediately', () => {
    localStorage.setItem('token', `header.${btoa(JSON.stringify({ exp: 1 }))}.signature`);
    render(<AuthProvider><AuthProbe /></AuthProvider>);
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('synchronizes a replacement session from another tab', () => {
    render(<AuthProvider><AuthProbe /></AuthProvider>);
    act(() => {
      localStorage.setItem('username', 'another-user');
      localStorage.setItem('role', 'CUSTOMER');
      localStorage.setItem('token', createTestToken());
      window.dispatchEvent(new StorageEvent('storage', { key: 'token', newValue: localStorage.getItem('token') }));
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('username')).toHaveTextContent('another-user');
  });
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('restores authentication and admin role from storage', () => {
    localStorage.setItem('token', createTestToken());
    localStorage.setItem('username', 'admin');
    localStorage.setItem('role', 'ADMIN');

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('admin')).toHaveTextContent('true');
    expect(screen.getByTestId('username')).toHaveTextContent('admin');
  });

  it('stores login response and clears it on logout', async () => {
    const loginToken = createTestToken();
    vi.mocked(authService.login).mockResolvedValue({
      token: loginToken,
      username: 'alice',
      role: 'CUSTOMER',
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );
    fireEvent.click(screen.getByText('login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(localStorage.getItem('token')).toBe(loginToken);
      expect(localStorage.getItem('username')).toBe('alice');
      expect(localStorage.getItem('role')).toBe('CUSTOMER');
    });

    fireEvent.click(screen.getByText('logout'));
    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('false'));
    expect(authService.logout).toHaveBeenCalledOnce();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('stores registration response and recognizes an admin role', async () => {
    const registrationToken = createTestToken();
    vi.mocked(authService.register).mockResolvedValue({
      token: registrationToken,
      username: 'new-user',
      role: 'ADMIN',
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );
    fireEvent.click(screen.getByText('register'));

    await waitFor(() => expect(screen.getByTestId('admin')).toHaveTextContent('true'));
    expect(localStorage.getItem('token')).toBe(registrationToken);
    expect(localStorage.getItem('role')).toBe('ADMIN');
  });
});
