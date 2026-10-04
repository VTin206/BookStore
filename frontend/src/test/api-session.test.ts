import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import { apiClient } from '../services/apiClient';

const originalAdapter = apiClient.defaults.adapter;
afterEach(() => { apiClient.defaults.adapter = originalAdapter; });
beforeEach(() => localStorage.clear());

describe('API session boundaries', () => {
  it('does not attach an expired session to login', async () => {
    localStorage.setItem('token', 'expired');
    apiClient.defaults.adapter = async config => {
      expect(config.headers.Authorization).toBeUndefined();
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };
    await apiClient.post('/auth/login', { username: 'alice', password: 'test-only' });
  });

  it('does not clear a newer login when an older request returns 401', async () => {
    localStorage.setItem('token', 'old');
    apiClient.defaults.adapter = async config => {
      localStorage.setItem('token', 'new');
      throw new AxiosError('Unauthorized', '401', config, {}, { data: {}, status: 401, statusText: '', headers: {}, config });
    };
    await expect(apiClient.get('/cart')).rejects.toThrow();
    expect(localStorage.getItem('token')).toBe('new');
  });

  it('clears the matching session and notifies the context on 401', async () => {
    localStorage.setItem('token', 'current');
    const expired = vi.fn();
    window.addEventListener('auth:expired', expired);
    apiClient.defaults.adapter = async config => {
      throw new AxiosError('Unauthorized', '401', config, {}, { data: {}, status: 401, statusText: '', headers: {}, config });
    };
    await expect(apiClient.get('/cart')).rejects.toThrow();
    expect(localStorage.getItem('token')).toBeNull();
    expect(expired).toHaveBeenCalledOnce();
    window.removeEventListener('auth:expired', expired);
  });
});
