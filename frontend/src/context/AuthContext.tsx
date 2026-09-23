import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('role') || 'CUSTOMER');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (username) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
  }, [username]);

  useEffect(() => {
    if (role) {
      localStorage.setItem('role', role);
    } else {
      localStorage.removeItem('role');
    }
  }, [role]);

  const login = async (data: LoginData): Promise<AuthResponse> => {
    const res = await authService.login(data);
    setToken(res.token);
    setUsername(res.username);
    setRole(res.role || 'CUSTOMER');
    return res;
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const res = await authService.register(data);
    setToken(res.token);
    setUsername(res.username);
    setRole(res.role || 'CUSTOMER');
    return res;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUsername(null);
    setRole('CUSTOMER');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  };

  const isAuthenticated = !!token;
  const isAdmin = role?.toUpperCase() === 'ADMIN';

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
