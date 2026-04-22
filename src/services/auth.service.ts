import api, { setAccessToken } from '@/services/api';
import type { AuthTokens, LoginRequest, RegisterRequest } from '@/types/api.types';

async function setRefreshTokenCookie(refreshToken: string): Promise<void> {
  await fetch('/api/auth/set-refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
}

async function login(data: LoginRequest): Promise<AuthTokens> {
  const response = await api.post<AuthTokens>('/auth/login', data);
  const tokens = response.data;
  setAccessToken(tokens.accessToken);
  await setRefreshTokenCookie(tokens.refreshToken);
  return tokens;
}

async function register(data: RegisterRequest): Promise<AuthTokens> {
  const response = await api.post<AuthTokens>('/auth/register', data);
  const tokens = response.data;
  setAccessToken(tokens.accessToken);
  await setRefreshTokenCookie(tokens.refreshToken);
  return tokens;
}

async function logout(): Promise<void> {
  setAccessToken(null);
  await fetch('/api/auth/logout', { method: 'POST' });
}

export const authService = { login, register, logout };
