import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'portfolio.json');

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.dirname(DATA_FILE);
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Read portfolio data
async function readPortfolio() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        // Return default structure if file doesn't exist
        return { items: [] };
    }
}

// Write portfolio data
async function writePortfolio(data: any) {
    await ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Check authorization
function isAuthorized(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    return authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

// GET - Retrieve all portfolio items
export async function GET() {
    try {
        const data = await readPortfolio();
        return NextResponse.json(data);
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

        const data = await readPortfolio();

        const newItem = {
            id: Date.now().toString(),
            title,
            category,
            file: url,
            public_id,
            createdAt: new Date().toISOString(),
        };

        data.items.unshift(newItem);
        await writePortfolio(data);

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

        const data = await readPortfolio();

        if (indexStr !== null) {
            // Delete by index
            const index = parseInt(indexStr, 10);
            if (isNaN(index) || index < 0 || index >= data.items.length) {
                return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
            }
            data.items.splice(index, 1);
        } else if (id) {
            // Delete by ID (legacy support)
            const initialLength = data.items.length;
            data.items = data.items.filter((item: any) => item.id !== id);
            if (data.items.length === initialLength) {
                return NextResponse.json({ error: 'Item not found' }, { status: 404 });
            }
        } else {
            return NextResponse.json({ error: 'Missing item ID or index' }, { status: 400 });
        }

        await writePortfolio(data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
