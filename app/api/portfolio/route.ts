import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const PORTFOLIO_KEY = 'portfolio:items';

// Check authorization
function isAuthorized(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    return authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

// GET - Retrieve all portfolio items
export async function GET() {
    try {
        const items = await redis.get<any[]>(PORTFOLIO_KEY) || [];
        return NextResponse.json({ items });
    } catch (error) {
        console.error('Error reading portfolio:', error);
        return NextResponse.json({ error: 'Failed to read portfolio' }, { status: 500 });
    }
}

// POST - Add a new portfolio item
export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, category, url, public_id } = body;

        if (!title || !category || !url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get existing items
        const items = await redis.get<any[]>(PORTFOLIO_KEY) || [];

        const newItem = {
            id: Date.now().toString(),
            title,
            category,
            file: url,
            public_id,
            createdAt: new Date().toISOString(),
        };

        // Add new item at the beginning
        items.unshift(newItem);

        // Save back to Redis
        await redis.set(PORTFOLIO_KEY, items);

        return NextResponse.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Error adding item:', error);
        return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
    }
}

// DELETE - Remove a portfolio item
export async function DELETE(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const indexStr = searchParams.get('index');

        // Get existing items
        const items = await redis.get<any[]>(PORTFOLIO_KEY) || [];

        if (indexStr !== null) {
            // Delete by index
            const index = parseInt(indexStr, 10);
            if (isNaN(index) || index < 0 || index >= items.length) {
                return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
            }
            items.splice(index, 1);
        } else if (id) {
            // Delete by ID
            const initialLength = items.length;
            const filtered = items.filter((item: any) => item.id !== id);
            if (filtered.length === initialLength) {
                return NextResponse.json({ error: 'Item not found' }, { status: 404 });
            }
            items.length = 0;
            items.push(...filtered);
        } else {
            return NextResponse.json({ error: 'Missing item ID or index' }, { status: 400 });
        }

        // Save back to Redis
        await redis.set(PORTFOLIO_KEY, items);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
