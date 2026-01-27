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
        let deletedItem: any = null;

        if (indexStr !== null) {
            // Delete by index
            const index = parseInt(indexStr, 10);
            if (isNaN(index) || index < 0 || index >= items.length) {
                return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
            }
            deletedItem = items[index];
            items.splice(index, 1);
        } else if (id) {
            // Delete by ID
            const itemIndex = items.findIndex((item: any) => item.id === id);
            if (itemIndex === -1) {
                return NextResponse.json({ error: 'Item not found' }, { status: 404 });
            }
            deletedItem = items[itemIndex];
            items.splice(itemIndex, 1);
        } else {
            return NextResponse.json({ error: 'Missing item ID or index' }, { status: 400 });
        }

        // Delete from Cloudinary if public_id exists
        if (deletedItem?.public_id) {
            try {
                const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
                const apiKey = process.env.CLOUDINARY_API_KEY;
                const apiSecret = process.env.CLOUDINARY_API_SECRET;

                const timestamp = Math.round(Date.now() / 1000);
                const signatureString = `public_id=${deletedItem.public_id}&timestamp=${timestamp}${apiSecret}`;

                // Create SHA1 signature
                const encoder = new TextEncoder();
                const data = encoder.encode(signatureString);
                const hashBuffer = await crypto.subtle.digest('SHA-1', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                const formData = new FormData();
                formData.append('public_id', deletedItem.public_id);
                formData.append('timestamp', timestamp.toString());
                formData.append('api_key', apiKey!);
                formData.append('signature', signature);

                await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
                    method: 'POST',
                    body: formData,
                });

                console.log('Image deleted from Cloudinary:', deletedItem.public_id);
            } catch (cloudinaryError) {
                console.error('Error deleting from Cloudinary:', cloudinaryError);
                // Continue even if Cloudinary deletion fails
            }
        }

        // Save back to Redis
        await redis.set(PORTFOLIO_KEY, items);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}

// PATCH - Update a portfolio item (title only for now)
export async function PATCH(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { index, title } = body;

        if (index === undefined || index === null) {
            return NextResponse.json({ error: 'Missing item index' }, { status: 400 });
        }

        if (!title || title.trim() === '') {
            return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
        }

        // Get existing items
        const items = await redis.get<any[]>(PORTFOLIO_KEY) || [];

        if (index < 0 || index >= items.length) {
            return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
        }

        // Update the title
        items[index].title = title.trim();

        // Save back to Redis
        await redis.set(PORTFOLIO_KEY, items);

        return NextResponse.json({ success: true, item: items[index] });
    } catch (error) {
        console.error('Error updating item:', error);
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}
