import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (refreshToken) {
    try {
      await fetch(`${API_URL}/auth/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch { /* si falla la revocación, igual limpiamos la cookie */ }
  }

  cookieStore.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
