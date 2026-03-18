import api, { setAccessToken } from '@/services/api';
import type { AuthTokens, LoginRequest, RegisterRequest } from '@/types/api.types';

async function setRefreshTokenCookie(refreshToken: string): Promise<void> {
  await fetch('/api/auth/set-refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
}

async function clearRefreshTokenCookie(): Promise<void> {
  await fetch('/api/auth/clear-refresh-token', { method: 'POST' });
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

async function refresh(): Promise<AuthTokens> {
  const cookieResponse = await fetch('/api/auth/refresh-token');
  if (!cookieResponse.ok) {
    throw new Error('No refresh token available');
  }
  const { refreshToken } = await cookieResponse.json();

  const response = await api.post<AuthTokens>('/auth/refresh', { refreshToken });
  const tokens = response.data;
  setAccessToken(tokens.accessToken);
  await setRefreshTokenCookie(tokens.refreshToken);
  return tokens;
}

async function logout(): Promise<void> {
  const cookieResponse = await fetch('/api/auth/refresh-token');
  if (cookieResponse.ok) {
    const { refreshToken } = await cookieResponse.json();
    await api.post('/auth/revoke', { refreshToken });
  }
  setAccessToken(null);
  await clearRefreshTokenCookie();
}

export const authService = {
  login,
  register,
  refresh,
  logout,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
