import { NextResponse, type NextRequest } from 'next/server';

/**
 * Edge guard for authentication-aware routing.
 *
 * The JWTs are httpOnly cookies, so middleware cannot inspect their contents;
 * it only checks whether a session cookie exists. Real authorization stays on
 * the API (every request is validated server-side) — this is purely a UX guard
 * that avoids flashing protected pages at signed-out visitors.
 *
 * The cookie names mirror `backend/app/core/security.py`.
 */
const ACCESS_COOKIE = 'metanutri_access';
const REFRESH_COOKIE = 'metanutri_refresh';

// An expired access token is fine as long as the refresh token is still there:
// the client silently refreshes on the next 401.
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/genomic',
  '/microbiome',
  '/metabolomics',
  '/datasets',
  '/recommendations',
  '/predict',
  '/profile',
  '/meal-plan',
  '/explore',
];

const AUTH_PAGES = ['/login', '/forgot-password'];

const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(
    request.cookies.get(ACCESS_COOKIE)?.value || request.cookies.get(REFRESH_COOKIE)?.value
  );

  if (!hasSession && matches(pathname, PROTECTED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (hasSession && matches(pathname, AUTH_PAGES)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes (they are proxied by rewrites) and static assets.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|twitter-image).*)'],
};
