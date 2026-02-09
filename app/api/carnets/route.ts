import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';
import cloudinary from '@/app/lib/cloudinary';
import { isAuthorized, unauthorized } from '@/app/lib/auth';
import { carnetPatchSchema } from '@/app/lib/schemas';

interface CarnetPage {
    pageNumber: number;
    url: string;
    public_id: string;
}

interface Carnet {
    id: string;
    number: number;
    title: string;
    coverUrl: string;
    pages: CarnetPage[];
    createdAt: string;
}

// Parse filename like "C.1.2.jpg" or "C.C 1.1.jpg" to get carnet and page numbers
function parseCarnetFilename(filename: string): { carnetNumber: number; pageNumber: number } | null {
    // Remove extension
    const baseName = filename.replace(/\.[^/.]+$/, '');

    // Match patterns like "C.1.2", "C.C 1.1", "C.C.1.1", "C 1 2", etc.
    const patterns = [
        /^C\.?C?\s*\.?(\d+)\.(\d+)$/i,  // C.1.2, C.C.1.2, C.C 1.2
        /^C\.?C?\s+(\d+)\.(\d+)$/i,     // C 1.2, C.C 1.2
        /^C\.?C?\s*(\d+)\s+(\d+)$/i,    // C 1 2, C.C 1 2
    ];

    for (const pattern of patterns) {
        const match = baseName.match(pattern);
        if (match) {
            return {
                carnetNumber: parseInt(match[1], 10),
                pageNumber: parseInt(match[2], 10),
            };
        }
    }
    return null;
}

// GET - Retrieve all carnets
export async function GET() {
    try {
        const carnets = await redis.get<Carnet[]>(KEYS.CARNETS) || [];
        // Sort by carnet number
        carnets.sort((a, b) => a.number - b.number);
        return NextResponse.json({ carnets });
    } catch (error) {
        console.error('Error reading carnets:', error);
        return NextResponse.json({ error: 'Failed to read carnets' }, { status: 500 });
    }
}

// POST - Upload multiple images and organize into carnets
export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return unauthorized();
    }

    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        // Get existing carnets
        const carnets = await redis.get<Carnet[]>(KEYS.CARNETS) || [];
        const carnetMap = new Map<number, Carnet>();
        carnets.forEach(c => carnetMap.set(c.number, c));

        // Process each file
        const uploadResults: { filename: string; success: boolean; error?: string }[] = [];

        for (const file of files) {
            const parsed = parseCarnetFilename(file.name);

            if (!parsed) {
                uploadResults.push({
                    filename: file.name,
                    success: false,
                    error: 'Invalid filename format. Expected C.X.Y (e.g., C.1.2)'
                });
                continue;
            }

            try {
                // Convert to base64 and upload to Cloudinary
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const base64 = buffer.toString('base64');
                const dataUri = `data:${file.type};base64,${base64}`;

                const result = await cloudinary.uploader.upload(dataUri, {
                    folder: 'helluo-somnia/carnets',
                    resource_type: 'image',
                });

                const page: CarnetPage = {
                    pageNumber: parsed.pageNumber,
                    url: result.secure_url,
                    public_id: result.public_id,
                };

                // Get or create carnet
                let carnet = carnetMap.get(parsed.carnetNumber);
                if (!carnet) {
                    carnet = {
                        id: `carnet-${parsed.carnetNumber}`,
                        number: parsed.carnetNumber,
                        title: `Carnet ${parsed.carnetNumber}`,
                        coverUrl: result.secure_url,
                        pages: [],
                        createdAt: new Date().toISOString(),
                    };
                    carnetMap.set(parsed.carnetNumber, carnet);
                }

                // Check if page already exists
                const existingPageIndex = carnet.pages.findIndex(p => p.pageNumber === parsed.pageNumber);
                if (existingPageIndex >= 0) {
                    // Replace existing page
                    carnet.pages[existingPageIndex] = page;
                } else {
                    carnet.pages.push(page);
                }

                // Sort pages and update cover
                carnet.pages.sort((a, b) => a.pageNumber - b.pageNumber);
                if (carnet.pages.length > 0) {
                    carnet.coverUrl = carnet.pages[0].url;
                }

                uploadResults.push({ filename: file.name, success: true });
            } catch (uploadError) {
                console.error(`Error uploading ${file.name}:`, uploadError);
                uploadResults.push({
                    filename: file.name,
                    success: false,
                    error: 'Upload to Cloudinary failed'
                });
            }
        }

        // Save updated carnets
        const updatedCarnets = Array.from(carnetMap.values()).sort((a, b) => a.number - b.number);
        await redis.set(KEYS.CARNETS, updatedCarnets);

        const successCount = uploadResults.filter(r => r.success).length;
        return NextResponse.json({
            success: true,
            uploaded: successCount,
            total: files.length,
            results: uploadResults,
            carnets: updatedCarnets,
        });
    } catch (error) {
        console.error('Error uploading carnets:', error);
        return NextResponse.json({ error: 'Failed to upload carnets' }, { status: 500 });
    }
}

// DELETE - Remove a carnet or a specific page
export async function DELETE(request: NextRequest) {
    if (!isAuthorized(request)) {
        return unauthorized();
    }

    try {
        const { searchParams } = new URL(request.url);
        const carnetId = searchParams.get('carnetId');
        const pageNumber = searchParams.get('pageNumber');

        if (!carnetId) {
            return NextResponse.json({ error: 'Missing carnet ID' }, { status: 400 });
        }

        const carnets = await redis.get<Carnet[]>(KEYS.CARNETS) || [];
        const carnetIndex = carnets.findIndex(c => c.id === carnetId);

        if (carnetIndex === -1) {
            return NextResponse.json({ error: 'Carnet not found' }, { status: 404 });
        }

        const carnet = carnets[carnetIndex];

        if (pageNumber) {
            // Delete specific page
            const pageNum = parseInt(pageNumber, 10);
            const pageIndex = carnet.pages.findIndex(p => p.pageNumber === pageNum);

            if (pageIndex === -1) {
                return NextResponse.json({ error: 'Page not found' }, { status: 404 });
            }

            // Delete from Cloudinary
            try {
                await cloudinary.uploader.destroy(carnet.pages[pageIndex].public_id);
            } catch (e) {
                console.error('Failed to delete from Cloudinary:', e);
            }

            carnet.pages.splice(pageIndex, 1);

            // If no pages left, delete the carnet
            if (carnet.pages.length === 0) {
                carnets.splice(carnetIndex, 1);
            } else {
                // Update cover
                carnet.coverUrl = carnet.pages[0].url;
            }
        } else {
            // Delete entire carnet
            for (const page of carnet.pages) {
                try {
                    await cloudinary.uploader.destroy(page.public_id);
                } catch (e) {
                    console.error('Failed to delete from Cloudinary:', e);
                }
            }
            carnets.splice(carnetIndex, 1);
        }

        await redis.set(KEYS.CARNETS, carnets);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting carnet:', error);
        return NextResponse.json({ error: 'Failed to delete carnet' }, { status: 500 });
    }
}

// PATCH - Update carnet title
export async function PATCH(request: NextRequest) {
    if (!isAuthorized(request)) {
        return unauthorized();
    }

    try {
        const body = await request.json();
        const result = carnetPatchSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
        }

        const { id, title } = result.data;
        const carnets = await redis.get<Carnet[]>(KEYS.CARNETS) || [];
        const carnetIndex = carnets.findIndex(c => c.id === id);

        if (carnetIndex === -1) {
            return NextResponse.json({ error: 'Carnet not found' }, { status: 404 });
        }

        if (title) {
            carnets[carnetIndex].title = title;
        }

        await redis.set(KEYS.CARNETS, carnets);
        return NextResponse.json({ success: true, carnet: carnets[carnetIndex] });
    } catch (error) {
        console.error('Error updating carnet:', error);
        return NextResponse.json({ error: 'Failed to update carnet' }, { status: 500 });
    }
}
