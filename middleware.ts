import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { guestRegex, isDevelopmentEnvironment } from './lib/constants';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // CORS for chat API
  if (pathname.startsWith('/api/chat')) {
    const origin = request.headers.get('origin') ?? '';
    const allowedOrigin = isDevelopmentEnvironment
      ? origin || '*'
      : process.env.CORS_ALLOWED_ORIGIN ?? '';
    const allowCredentials = allowedOrigin !== '*'
      && allowedOrigin !== '';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      const response = new Response(null, { status: 204 });
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
      response.headers.set('Vary', 'Origin');
      if (allowCredentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET,POST,DELETE,OPTIONS',
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      );
      response.headers.set('Access-Control-Max-Age', '86400');
      return response;
    }

    // Attach CORS headers to all /api/chat responses
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Vary', 'Origin');
    if (allowCredentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    );
    return response;
  }

  // CORS for widget chat API (no auth)
  if (pathname.startsWith('/api/widget-chat')) {
    const origin = request.headers.get('origin') ?? '';
    const allowedOrigin = isDevelopmentEnvironment
      ? origin || '*'
      : process.env.CORS_ALLOWED_ORIGIN ?? '';
    const allowCredentials = allowedOrigin !== '*'
      && allowedOrigin !== '';

    // Preflight
    if (request.method === 'OPTIONS') {
      const response = new Response(null, { status: 204 });
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
      response.headers.set('Vary', 'Origin');
      if (allowCredentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      );
      response.headers.set('Access-Control-Max-Age', '86400');
      return response;
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Vary', 'Origin');
    if (allowCredentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    );
    return response;
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (!token) {
    const redirectUrl = encodeURIComponent(request.url);

    return NextResponse.redirect(
      new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url),
    );
  }

  const isGuest = guestRegex.test(token?.email ?? '');

  if (token && !isGuest && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/api/:path*',
    '/login',
    '/register',

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
