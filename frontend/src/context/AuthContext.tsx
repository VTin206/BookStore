import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, LoginData, RegisterData } from '../services/authService';
import { AuthResponse } from '../types';

interface AuthContextType {
  token: string | null;
  username: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getTokenExpiry = (value: string): number | null => {
  try {
    const payload = value.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
    return typeof claims.exp === 'number' ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('role') || 'CUSTOMER');

  const synchronize = useCallback(() => {
    const storedToken = localStorage.getItem('token');
    const expiry = storedToken ? getTokenExpiry(storedToken) : null;
    if (storedToken && (expiry === null || expiry <= Date.now())) {
      ['token', 'username', 'role', 'user_info'].forEach(key => localStorage.removeItem(key));
    }
    setToken(localStorage.getItem('token'));
    setUsername(localStorage.getItem('username'));
    setRole(localStorage.getItem('role') || 'CUSTOMER');
  }, []);

  const saveSession = (res: AuthResponse) => {
    localStorage.setItem('username', res.username);
    localStorage.setItem('role', res.role || 'CUSTOMER');
    localStorage.setItem('token', res.token);
    synchronize();
  };

  const login = async (data: LoginData): Promise<AuthResponse> => {
    const res = await authService.login(data);
    saveSession(res);
    return res;
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const res = await authService.register(data);
    saveSession(res);
    return res;
  };

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem('token');
    setToken(null);
    setUsername(null);
    setRole('CUSTOMER');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }, []);

  useEffect(() => {
    if (!token) return;

    const expiresAt = getTokenExpiry(token);
    if (expiresAt === null || expiresAt <= Date.now()) {
      synchronize();
      return;
    }

    const timeout = window.setTimeout(synchronize, Math.min(expiresAt - Date.now(), 2147483647));
    return () => window.clearTimeout(timeout);
  }, [token, synchronize]);

  useEffect(() => {
    const handleExpired = () => synchronize();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'token' || event.key === null) synchronize();
    };

    window.addEventListener('auth:expired', handleExpired);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', synchronize);
    document.addEventListener('visibilitychange', synchronize);
    return () => {
      window.removeEventListener('auth:expired', handleExpired);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', synchronize);
      document.removeEventListener('visibilitychange', synchronize);
    };
  }, [synchronize]);

  const isAuthenticated = !!token && (getTokenExpiry(token) || 0) > Date.now();
  const isAdmin = isAuthenticated && role?.toUpperCase() === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        role,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
