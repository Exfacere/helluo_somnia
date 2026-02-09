import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';
import { isAuthorized, unauthorized } from '@/app/lib/auth';
import { exhibitionSchema, exhibitionPatchSchema } from '@/app/lib/schemas';

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

// GET - Retrieve all exhibitions
export async function GET() {
    try {
        const items = await redis.get<Exhibition[]>(KEYS.EXHIBITIONS) || [];
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
        return unauthorized();
    }

    try {
        const body = await request.json();
        const result = exhibitionSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
        }

        const { title, location, city, startDate, endDate, description, image, public_id } = result.data;
        const items = await redis.get<Exhibition[]>(KEYS.EXHIBITIONS) || [];

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

        items.push(newItem);
        await redis.set(KEYS.EXHIBITIONS, items);

        return NextResponse.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Error adding exhibition:', error);
        return NextResponse.json({ error: 'Failed to add exhibition' }, { status: 500 });
    }
}

// DELETE - Remove an exhibition
export async function DELETE(request: NextRequest) {
    if (!isAuthorized(request)) {
        return unauthorized();
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing exhibition ID' }, { status: 400 });
        }

        const items = await redis.get<Exhibition[]>(KEYS.EXHIBITIONS) || [];
        const initialLength = items.length;
        const filtered = items.filter((item) => item.id !== id);

        if (filtered.length === initialLength) {
            return NextResponse.json({ error: 'Exhibition not found' }, { status: 404 });
        }

        await redis.set(KEYS.EXHIBITIONS, filtered);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting exhibition:', error);
        return NextResponse.json({ error: 'Failed to delete exhibition' }, { status: 500 });
    }
}

// PATCH - Update an exhibition
export async function PATCH(request: NextRequest) {
    if (!isAuthorized(request)) {
        return unauthorized();
    }

    try {
        const body = await request.json();
        const result = exhibitionPatchSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
        }

        const { id, title, location, city, startDate, endDate, description, image, public_id } = result.data;
        const items = await redis.get<Exhibition[]>(KEYS.EXHIBITIONS) || [];

        const itemIndex = items.findIndex((item) => item.id === id);
        if (itemIndex === -1) {
            return NextResponse.json({ error: 'Exhibition not found' }, { status: 404 });
        }

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
        await redis.set(KEYS.EXHIBITIONS, items);

        return NextResponse.json({ success: true, item: updatedItem });
    } catch (error) {
        console.error('Error updating exhibition:', error);
        return NextResponse.json({ error: 'Failed to update exhibition' }, { status: 500 });
    }
}
