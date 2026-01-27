import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const EXHIBITIONS_KEY = 'exhibitions:items';

// Exhibition type
interface Exhibition {
    id: string;
    title: string;
    location: string;
    city: string;
    startDate: string;
    endDate?: string;
    description?: string;
    image?: string;
    public_id?: string;
    createdAt: string;
}

// Check authorization
function isAuthorized(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    return authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

// GET - Retrieve all exhibitions
export async function GET() {
    try {
        const items = await redis.get<Exhibition[]>(EXHIBITIONS_KEY) || [];
        // Sort by date (newest first)
        items.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        return NextResponse.json({ items });
    } catch (error) {
        console.error('Error reading exhibitions:', error);
        return NextResponse.json({ error: 'Failed to read exhibitions' }, { status: 500 });
    }
}

// POST - Add a new exhibition
export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, location, city, startDate, endDate, description, image, public_id } = body;

        if (!title || !location || !city || !startDate) {
            return NextResponse.json({ error: 'Missing required fields (title, location, city, startDate)' }, { status: 400 });
        }

        // Get existing items
        const items = await redis.get<Exhibition[]>(EXHIBITIONS_KEY) || [];

        const newItem: Exhibition = {
            id: Date.now().toString(),
            title,
            location,
            city,
            startDate,
            endDate: endDate || undefined,
            description: description || undefined,
            image: image || undefined,
            public_id: public_id || undefined,
            createdAt: new Date().toISOString(),
        };

        // Add new item
        items.push(newItem);

        // Save back to Redis
        await redis.set(EXHIBITIONS_KEY, items);

        return NextResponse.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Error adding exhibition:', error);
        return NextResponse.json({ error: 'Failed to add exhibition' }, { status: 500 });
    }
}

// DELETE - Remove an exhibition
export async function DELETE(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing exhibition ID' }, { status: 400 });
        }

        // Get existing items
        const items = await redis.get<Exhibition[]>(EXHIBITIONS_KEY) || [];

        const initialLength = items.length;
        const filtered = items.filter((item) => item.id !== id);

        if (filtered.length === initialLength) {
            return NextResponse.json({ error: 'Exhibition not found' }, { status: 404 });
        }

        // Save back to Redis
        await redis.set(EXHIBITIONS_KEY, filtered);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting exhibition:', error);
        return NextResponse.json({ error: 'Failed to delete exhibition' }, { status: 500 });
    }
}

// PATCH - Update an exhibition
export async function PATCH(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, title, location, city, startDate, endDate, description, image, public_id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing exhibition ID' }, { status: 400 });
        }

        // Get existing items
        const items = await redis.get<Exhibition[]>(EXHIBITIONS_KEY) || [];

        const itemIndex = items.findIndex((item) => item.id === id);

        if (itemIndex === -1) {
            return NextResponse.json({ error: 'Exhibition not found' }, { status: 404 });
        }

        // Update fields
        const updatedItem = { ...items[itemIndex] };
        if (title !== undefined) updatedItem.title = title;
        if (location !== undefined) updatedItem.location = location;
        if (city !== undefined) updatedItem.city = city;
        if (startDate !== undefined) updatedItem.startDate = startDate;
        if (endDate !== undefined) updatedItem.endDate = endDate;
        if (description !== undefined) updatedItem.description = description;
        if (image !== undefined) updatedItem.image = image;
        if (public_id !== undefined) updatedItem.public_id = public_id;

        items[itemIndex] = updatedItem;

        // Save back to Redis
        await redis.set(EXHIBITIONS_KEY, items);

        return NextResponse.json({ success: true, item: updatedItem });
    } catch (error) {
        console.error('Error updating exhibition:', error);
        return NextResponse.json({ error: 'Failed to update exhibition' }, { status: 500 });
    }
}
