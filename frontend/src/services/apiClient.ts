import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const isAuthRequest = /\/auth\/(login|register)(?:\?|$)/.test(String(config.url || ''));
  if (token && !isAuthRequest && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url || '');
    const isAuthRequest = /\/auth\/(login|register)(?:\?|$)/.test(requestUrl);
    const token = localStorage.getItem('token');
    if (error.response?.status === 401 && !isAuthRequest && token
      && error.config?.headers?.Authorization === `Bearer ${token}`) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('user_info');
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);
