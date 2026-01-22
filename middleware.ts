/**
 * Middleware for workshop access control
 * Enforces server-side access restrictions on workshop docs
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { IronSession, getIronSession } from 'iron-session';
import { sessionOptions, type WorkshopSession } from './lib/session';
import { getDocIndex } from './lib/workshopAccess';

/**
 * Helper to get session from request cookies
 */
async function getSessionFromRequest(request: NextRequest): Promise<IronSession<WorkshopSession>> {
  const cookieStore = await cookies();
  return getIronSession<WorkshopSession>(cookieStore, sessionOptions);
}

/**
 * Middleware function
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow access to:
  // - Unlock page
  // - Unlock API
  // - Static assets
  // - Non-workshop pages
  if (
    pathname.startsWith('/unlock') ||
    pathname.startsWith('/api/unlock') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/og') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Check if this is a docs page
  if (pathname.startsWith('/docs')) {
    // Remove /docs prefix to get the slug
    const slug = pathname.slice('/docs/'.length).replace(/\.mdx$/, '');

    // Get the doc index
    const docIndex = getDocIndex(slug);

    // If it's not a workshop doc (index === -1), allow access
    if (docIndex === -1) {
      return NextResponse.next();
    }

    // It's a workshop doc - check access
    const session = await getSessionFromRequest(request);
    const maxUnlockedIndex = session.maxUnlockedIndex ?? 0; // Default: first chapter unlocked

    // If the doc index is greater than max unlocked, redirect to unlock
    if (docIndex > maxUnlockedIndex) {
      const url = request.nextUrl.clone();
      url.pathname = '/unlock';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Allow access
  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (except /api/unlock)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
