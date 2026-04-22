import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token');
  const { pathname } = request.nextUrl;

  const isPublicRoute = pathname === '/login' || pathname === '/register';

  if (!refreshToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (refreshToken && isPublicRoute) {
    return NextResponse.redirect(new URL('/calendar', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
};
