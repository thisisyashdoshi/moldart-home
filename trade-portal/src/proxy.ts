import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { env } from '@/lib/env';
import { DASHBOARD_ROUTE_BY_SCOPE, PUBLIC_PORTAL_ROUTES } from '@/lib/portal-config';
import { getClientIp, rateLimit } from '@/server/security/rate-limit';

function isPublicPortalRoute(pathname: string) {
  return PUBLIC_PORTAL_ROUTES.some((route) => pathname === route);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/api/auth/')) {
    if (pathname.endsWith('/callback/credentials') && request.method === 'POST') {
      const ip = getClientIp(request.headers);
      const limited = await rateLimit({ key: `login:${ip}`, limit: 10, windowSeconds: 60 * 10 });
      if (!limited.success) {
        return NextResponse.json({ message: 'Too many login attempts' }, { status: 429 });
      }
    }
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: env.AUTH_SECRET });
  const isPublic = isPublicPortalRoute(pathname);

  if (isPublic && token?.scope && pathname === '/portal') {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTE_BY_SCOPE[token.scope], request.url));
  }

  if (!isPublic && pathname.startsWith('/portal/')) {
    if (!token?.scope) {
      return NextResponse.redirect(new URL('/portal', request.url));
    }

    if (pathname.startsWith('/portal/buyer/') && token.scope !== 'buyer') {
      return NextResponse.redirect(new URL(DASHBOARD_ROUTE_BY_SCOPE[token.scope], request.url));
    }

    if (pathname.startsWith('/portal/seller/') && token.scope !== 'seller') {
      return NextResponse.redirect(new URL(DASHBOARD_ROUTE_BY_SCOPE[token.scope], request.url));
    }

    if (pathname.startsWith('/portal/admin/') && token.scope !== 'admin') {
      return NextResponse.redirect(new URL(DASHBOARD_ROUTE_BY_SCOPE[token.scope], request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/api/auth/:path*'],
};
