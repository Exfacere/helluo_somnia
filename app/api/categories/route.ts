import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';
import { isAuthorized, unauthorized } from '@/app/lib/auth';
import { categorySchema, categoryPatchSchema } from '@/app/lib/schemas';

interface Category {
    id: string;
    name: string;
    order: number;
}

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
    { id: 'pyro', name: 'Pyrogravure', order: 1 },
    { id: 'peinture', name: 'Peinture', order: 2 },
    { id: 'divers', name: 'Divers', order: 3 },
];

// GET - Retrieve all categories
export async function GET() {
    try {
        let categories = await redis.get<Category[]>(KEYS.CATEGORIES);

        // Sync with default categories: remove deleted ones, add missing ones
        const defaultIds = new Set(DEFAULT_CATEGORIES.map(c => c.id));
        if (!categories || categories.length === 0) {
            categories = DEFAULT_CATEGORIES;
        } else {
            // Remove categories that are no longer in defaults
            categories = categories.filter(c => defaultIds.has(c.id));
            // Add any new default categories not yet present
            const existingIds = new Set(categories.map(c => c.id));
            for (const def of DEFAULT_CATEGORIES) {
                if (!existingIds.has(def.id)) {
                    categories.push(def);
                }
            }
            // Sync names and reorder
            for (const cat of categories) {
                const def = DEFAULT_CATEGORIES.find(d => d.id === cat.id);
                if (def) {
                    cat.name = def.name;
                    cat.order = def.order;
                }
            }
        }

        categories.sort((a, b) => a.order - b.order);
        await redis.set(KEYS.CATEGORIES, categories);
        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Error reading categories:', error);
        return NextResponse.json({ error: 'Failed to read categories' }, { status: 500 });
    }
}

// POST - Add a new category
export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return unauthorized();
    }

    try {
        const body = await request.json();
        const result = categorySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
        }

        const { id, name } = result.data;
        let categories = await redis.get<Category[]>(KEYS.CATEGORIES) || DEFAULT_CATEGORIES;

        if (categories.some(cat => cat.id === id)) {
            return NextResponse.json({ error: 'Category ID already exists' }, { status: 400 });
        }

        const newCategory: Category = {
            id,
            name,
            order: categories.length + 1,
        };

        categories.push(newCategory);
        await redis.set(KEYS.CATEGORIES, categories);

        return NextResponse.json({ success: true, category: newCategory });
    } catch (error) {
        console.error('Error adding category:', error);
        return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
    }
}

// DELETE - Remove a category
export async function DELETE(request: NextRequest) {
    if (!isAuthorized(request)) {
        return unauthorized();
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
        }

        let categories = await redis.get<Category[]>(KEYS.CATEGORIES) || DEFAULT_CATEGORIES;
        const initialLength = categories.length;
        categories = categories.filter(cat => cat.id !== id);

        if (categories.length === initialLength) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Re-order remaining categories
        categories.forEach((cat, index) => {
            cat.order = index + 1;
        });

        await redis.set(KEYS.CATEGORIES, categories);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}

// PATCH - Update a category (name or order)
export async function PATCH(request: NextRequest) {
    if (!isAuthorized(request)) {
        return unauthorized();
    }

    try {
        const body = await request.json();
        const result = categoryPatchSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
        }

        const { id, name, order } = result.data;
        let categories = await redis.get<Category[]>(KEYS.CATEGORIES) || DEFAULT_CATEGORIES;

        const categoryIndex = categories.findIndex(cat => cat.id === id);
        if (categoryIndex === -1) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        if (name) {
            categories[categoryIndex].name = name;
        }
        if (order !== undefined) {
            categories[categoryIndex].order = order;
            categories.sort((a, b) => a.order - b.order);
        }

        await redis.set(KEYS.CATEGORIES, categories);
        return NextResponse.json({ success: true, category: categories[categoryIndex] });
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}
