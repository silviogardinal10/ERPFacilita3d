import { useState, useCallback, useEffect, createContext, useContext, createElement } from 'react';
import api from '../lib/api';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  provider: 'email';
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  hasPermission: (permission: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('erp3d_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('erp3d_user');
      }
    }
    setIsLoading(false);
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.token) {
        const loggedUser = { ...response.data.user, token: response.data.token };
        setUser(loggedUser);
        localStorage.setItem('erp3d_user', JSON.stringify(loggedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('erp3d_user');
  }, []);

  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    if (!user) return false;
    try {
      await api.put('/users/change-password', { currentPassword, newPassword });
      return true;
    } catch (error) {
      return false;
    }
  }, [user]);

  const hasPermission = useCallback((permission: UserRole): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === permission;
  }, [user]);

  return createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithEmail,
        logout,
        changePassword,
        hasPermission,
      },
    },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

