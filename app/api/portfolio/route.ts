import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';
import cloudinary from '@/app/lib/cloudinary';
import { isAuthorized, unauthorized } from '@/app/lib/auth';
import { portfolioItemSchema, portfolioPatchSchema } from '@/app/lib/schemas';

interface PortfolioItem {
    id: string;
    title: string;
    category: string;
    file: string;
    public_id?: string;
    createdAt: string;
}

// GET - Retrieve all portfolio items
export async function GET() {
    try {
        const items = await redis.get<PortfolioItem[]>(KEYS.PORTFOLIO) || [];
        return NextResponse.json({ items });
    } catch (error) {
        console.error('Error reading portfolio:', error);
        return NextResponse.json({ error: 'Failed to read portfolio' }, { status: 500 });
    }
}

// POST - Add a new portfolio item
export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return unauthorized();
    }

    try {
        const body = await request.json();
        const result = portfolioItemSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
        }

        const { title, category, url, public_id } = result.data;
        const items = await redis.get<PortfolioItem[]>(KEYS.PORTFOLIO) || [];

        const newItem: PortfolioItem = {
            id: Date.now().toString(),
            title,
            category,
            file: url,
            public_id,
            createdAt: new Date().toISOString(),
        };

        items.unshift(newItem);
        await redis.set(KEYS.PORTFOLIO, items);

        return NextResponse.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Error adding item:', error);
        return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
    }
}

// DELETE - Remove a portfolio item
export async function DELETE(request: NextRequest) {
    if (!isAuthorized(request)) {
        return unauthorized();
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const indexStr = searchParams.get('index');

        const items = await redis.get<PortfolioItem[]>(KEYS.PORTFOLIO) || [];
        let itemToDelete: PortfolioItem | null = null;

        if (indexStr !== null) {
            const index = parseInt(indexStr, 10);
            if (isNaN(index) || index < 0 || index >= items.length) {
                return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
            }
            itemToDelete = items[index];
            items.splice(index, 1);
        } else if (id) {
            const itemIndex = items.findIndex((item) => item.id === id);
            if (itemIndex === -1) {
                return NextResponse.json({ error: 'Item not found' }, { status: 404 });
            }
            itemToDelete = items[itemIndex];
            items.splice(itemIndex, 1);
        } else {
            return NextResponse.json({ error: 'Missing item ID or index' }, { status: 400 });
        }

        // Delete image from Cloudinary if public_id exists
        if (itemToDelete?.public_id) {
            try {
                await cloudinary.uploader.destroy(itemToDelete.public_id);
            } catch (cloudinaryError) {
                console.error('Failed to delete Cloudinary image:', cloudinaryError);
            }
        }

        await redis.set(KEYS.PORTFOLIO, items);
        return NextResponse.json({ success: true, deletedCloudinaryImage: !!itemToDelete?.public_id });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}

// PATCH - Update a portfolio item (title only)
export async function PATCH(request: NextRequest) {
    if (!isAuthorized(request)) {
        return unauthorized();
    }

    try {
        const body = await request.json();
        const result = portfolioPatchSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
        }

        const { index, title } = result.data;
        const items = await redis.get<PortfolioItem[]>(KEYS.PORTFOLIO) || [];

        if (index < 0 || index >= items.length) {
            return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
        }

        items[index].title = title.trim();
        await redis.set(KEYS.PORTFOLIO, items);

        return NextResponse.json({ success: true, item: items[index] });
    } catch (error) {
        console.error('Error updating item:', error);
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}
