import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PREFIX = '/admin';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith(ADMIN_PREFIX)) return;

  const token = req.cookies.get('access_token')?.value;
  if (!token && pathname !== '/admin/login') {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
