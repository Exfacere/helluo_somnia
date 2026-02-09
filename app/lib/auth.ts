import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

/**
 * Check if request has valid admin authorization
 * Uses timing-safe comparison to prevent timing attacks
 */
export function isAuthorized(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;

    const token = authHeader.replace('Bearer ', '');
    const expected = process.env.ADMIN_PASSWORD || '';

    // Prevent timing attacks by ensuring constant-time comparison
    if (token.length !== expected.length) return false;

    try {
        return timingSafeEqual(
            Buffer.from(token),
            Buffer.from(expected)
        );
    } catch {
        return false;
    }
}

/**
 * Return a 401 Unauthorized response
 */
export function unauthorized() {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
