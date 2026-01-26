import { NextRequest, NextResponse } from 'next/server';

// POST - Verify admin password
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: 'Password required' }, { status: 400 });
        }

        const isValid = password === process.env.ADMIN_PASSWORD;

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
