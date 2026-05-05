import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isDemo: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  enterDemo: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('devboard_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(localStorage.getItem('devboard_demo') === 'true');

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('devboard_token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (newToken: string) => {
    localStorage.setItem('devboard_token', newToken);
    setToken(newToken);
    setIsDemo(false);
    localStorage.removeItem('devboard_demo');
    const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${newToken}` } });
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem('devboard_token');
    localStorage.removeItem('devboard_demo');
    setToken(null);
    setUser(null);
    setIsDemo(false);
  };

  const enterDemo = () => {
    localStorage.setItem('devboard_demo', 'true');
    setIsDemo(true);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isDemo, login, logout, enterDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
