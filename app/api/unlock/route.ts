/**
 * Unlock API route
 * Validates passwords and unlocks workshop chapters
 */

import { NextRequest, NextResponse } from 'next/server';
import { setMaxUnlockedIndex, getMaxUnlockedIndex } from '@/lib/session';
import { validatePasswordBySlug } from '@/lib/workshopPasswords';
import { getDocIndex } from '@/lib/workshopAccess';

/**
 * Simple in-memory rate limiting
 * In production, you might want to use Redis or a more robust solution
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // Create new record
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Too many attempts. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { slug, password } = body;

    console.log('[Unlock API] Request:', { slug, passwordLength: password?.length, ip });

    // Validate input
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Invalid slug' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // Get the doc index
    const docIndex = getDocIndex(slug);
    console.log('[Unlock API] Doc index:', docIndex);

    if (docIndex === -1) {
      return NextResponse.json(
        { ok: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get current max unlocked index
    const currentMax = await getMaxUnlockedIndex();
    console.log('[Unlock API] Current max unlocked:', currentMax);

    // If already unlocked, just return success
    if (docIndex <= currentMax) {
      return NextResponse.json({
        ok: true,
        alreadyUnlocked: true,
        maxUnlockedIndex: currentMax,
      });
    }

    // Validate the password
    const isPasswordValid = validatePasswordBySlug(slug, password);
    console.log('[Unlock API] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { ok: false, error: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Unlock this chapter (and all previous ones by setting the max)
    await setMaxUnlockedIndex(docIndex);

    console.log('[Unlock API] Unlocked successfully, new max:', docIndex);

    return NextResponse.json({
      ok: true,
      maxUnlockedIndex: docIndex,
    });
  } catch (error) {
    console.error('Unlock API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
