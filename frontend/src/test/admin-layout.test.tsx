import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminLayout } from '../layouts/AdminLayout';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const renderAdminRoute = () =>
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminLayout><div>private content</div></AdminLayout>} />
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/" element={<div>store page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('AdminLayout access guard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects unauthenticated users to login', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      username: null,
      logout: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderAdminRoute();

    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(screen.queryByText('private content')).not.toBeInTheDocument();
  });

  it('redirects authenticated non-admin users to store', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      username: 'alice',
      logout: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderAdminRoute();

    expect(screen.getByText('store page')).toBeInTheDocument();
    expect(screen.queryByText('private content')).not.toBeInTheDocument();
  });

  it('renders private content for admins', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      username: 'admin',
      logout: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderAdminRoute();

    expect(screen.getByText('private content')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });
});