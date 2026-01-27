import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CATEGORIES_KEY = 'portfolio:categories';

// Default categories
const DEFAULT_CATEGORIES = [
    { id: 'pyro', name: 'Pyrogravures', order: 1 },
    { id: 'peinture', name: 'Peintures', order: 2 },
    { id: 'collage', name: 'Collages', order: 3 },
    { id: 'gravure', name: 'Gravures', order: 4 },
    { id: 'divers', name: 'Divers', order: 5 },
];

interface Category {
    id: string;
    name: string;
    order: number;
}

// Check authorization
function isAuthorized(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    return authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

// GET - Retrieve all categories
export async function GET() {
    try {
        let categories = await redis.get<Category[]>(CATEGORIES_KEY);

        // If no categories exist, initialize with defaults
        if (!categories || categories.length === 0) {
            categories = DEFAULT_CATEGORIES;
            await redis.set(CATEGORIES_KEY, categories);
        }

        // Sort by order
        categories.sort((a, b) => a.order - b.order);

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Error reading categories:', error);
        return NextResponse.json({ error: 'Failed to read categories' }, { status: 500 });
    }
}

// POST - Add a new category
export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, name } = body;

        if (!id || !name) {
            return NextResponse.json({ error: 'Missing required fields (id, name)' }, { status: 400 });
        }

        // Validate id format (lowercase, no spaces)
        if (!/^[a-z0-9_-]+$/.test(id)) {
            return NextResponse.json({ error: 'ID must be lowercase with no spaces (use - or _)' }, { status: 400 });
        }

        // Get existing categories
        let categories = await redis.get<Category[]>(CATEGORIES_KEY) || DEFAULT_CATEGORIES;

        // Check if id already exists
        if (categories.some(cat => cat.id === id)) {
            return NextResponse.json({ error: 'Category ID already exists' }, { status: 400 });
        }

        // Add new category at the end
        const newCategory: Category = {
            id,
            name,
            order: categories.length + 1,
        };

        categories.push(newCategory);

        // Save back to Redis
        await redis.set(CATEGORIES_KEY, categories);

        return NextResponse.json({ success: true, category: newCategory });
    } catch (error) {
        console.error('Error adding category:', error);
        return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
    }
}

// DELETE - Remove a category
export async function DELETE(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
        }

        // Get existing categories
        let categories = await redis.get<Category[]>(CATEGORIES_KEY) || DEFAULT_CATEGORIES;

        // Find and remove the category
        const initialLength = categories.length;
        categories = categories.filter(cat => cat.id !== id);

        if (categories.length === initialLength) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Re-order remaining categories
        categories.forEach((cat, index) => {
            cat.order = index + 1;
        });

        // Save back to Redis
        await redis.set(CATEGORIES_KEY, categories);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}

// PATCH - Update a category (name or order)
export async function PATCH(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, name, order } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
        }

        // Get existing categories
        let categories = await redis.get<Category[]>(CATEGORIES_KEY) || DEFAULT_CATEGORIES;

        // Find the category
        const categoryIndex = categories.findIndex(cat => cat.id === id);
        if (categoryIndex === -1) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Update fields
        if (name) {
            categories[categoryIndex].name = name;
        }
        if (order !== undefined) {
            categories[categoryIndex].order = order;
            // Re-sort by order
            categories.sort((a, b) => a.order - b.order);
        }

        // Save back to Redis
        await redis.set(CATEGORIES_KEY, categories);

        return NextResponse.json({ success: true, category: categories[categoryIndex] });
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}
