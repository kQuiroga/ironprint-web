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

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeUserFromJwt(token: string): User {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return {
    email: payload.email,
    displayName: payload.display_name,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function rehydrate() {
      try {
        const tokens = await authService.refresh();
        setUser(decodeUserFromJwt(tokens.accessToken));
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    rehydrate();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const tokens = await authService.login(data);
    setUser(decodeUserFromJwt(tokens.accessToken));
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const tokens = await authService.register(data);
    setUser(decodeUserFromJwt(tokens.accessToken));
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setAccessToken(null);
    setUser(null);
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
