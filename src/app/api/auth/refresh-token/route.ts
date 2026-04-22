import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      cookieStore.set('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      });
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }

    const data = await response.json();

    cookieStore.set('refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return NextResponse.json({ accessToken: data.accessToken });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
