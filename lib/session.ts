/**
 * Session management for workshop access control
 * Uses iron-session for encrypted, signed HTTP-only cookies
 */

import { IronSession, getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

/**
 * Session data structure
 */
export interface WorkshopSession {
  maxUnlockedIndex: number;
}

/**
 * Session configuration
 */
export const sessionOptions = {
  password: process.env.WORKSHOP_SESSION_SECRET || 'change-this-secret-in-production-min-32-chars-long',
  cookieName: 'ws_unlock',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    // Max age: 7 days
    maxAge: 60 * 60 * 24 * 7,
  },
};

/**
 * Get the session from the request
 */
export async function getSession(): Promise<IronSession<WorkshopSession>> {
  const cookieStore = await cookies();
  return getIronSession<WorkshopSession>(cookieStore, sessionOptions);
}

/**
 * Get the maximum unlocked index from the session
 * Defaults to -1 (nothing unlocked) or 0 if you want the first chapter to be open
 */
export async function getMaxUnlockedIndex(): Promise<number> {
  const session = await getSession();
  return session.maxUnlockedIndex ?? 0; // Default: first chapter (index 0) is unlocked
}

/**
 * Set the maximum unlocked index in the session
 * Only updates if the new index is greater than the current one
 */
export async function setMaxUnlockedIndex(index: number): Promise<void> {
  const session = await getSession();

  // Only update if the new index is greater (prevent locking already unlocked chapters)
  if (index > (session.maxUnlockedIndex ?? 0)) {
    session.maxUnlockedIndex = index;
    await session.save();
  }
}

/**
 * Reset the session (for testing purposes)
 */
export async function resetSession(): Promise<void> {
  const session = await getSession();
  session.maxUnlockedIndex = 0;
  await session.save();
}

/**
 * Check if a specific doc slug is accessible
 */
export async function isSlugAccessible(slug: string): Promise<boolean> {
  const { isDocAccessible } = await import('./workshopAccess');
  const maxUnlockedIndex = await getMaxUnlockedIndex();
  return isDocAccessible(slug, maxUnlockedIndex);
}
