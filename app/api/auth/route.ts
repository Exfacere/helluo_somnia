import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { authSchema } from '@/app/lib/schemas';

// POST - Verify admin password
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = authSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Password required' }, { status: 400 });
        }

        const { password } = result.data;
        const expected = process.env.ADMIN_PASSWORD || '';

        // Timing-safe comparison to prevent timing attacks
        let isValid = false;
        if (password.length === expected.length) {
            try {
                isValid = timingSafeEqual(
                    Buffer.from(password),
                    Buffer.from(expected)
                );
            } catch {
                isValid = false;
            }
        }

        if (isValid) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
