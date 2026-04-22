'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { setAccessToken } from '@/services/api';
import { authService } from '@/services/auth.service';
import type { LoginRequest, RegisterRequest } from '@/types/api.types';

interface User {
  email: string;
  displayName: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const SESSION_KEY = 'ironprint_user';
const AuthContext = createContext<AuthContextValue | null>(null);

function decodeUserFromJwt(token: string): User {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return {
    email: payload.email ?? '',
    displayName: payload.name ?? '',
  };
}

function saveUser(user: User): void {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch { /* ignore */ }
}

function clearUser(): void {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored) as User);
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const tokens = await authService.login(data);
    const newUser = decodeUserFromJwt(tokens.accessToken);
    setUser(newUser);
    saveUser(newUser);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const tokens = await authService.register(data);
    const newUser = decodeUserFromJwt(tokens.accessToken);
    setUser(newUser);
    saveUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setAccessToken(null);
    setUser(null);
    clearUser();
    router.push('/login');
  }, [router]);

  return (
    <AuthContext value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
