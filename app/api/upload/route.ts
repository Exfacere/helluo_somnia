import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/app/lib/cloudinary';
import { isAuthorized, unauthorized } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return unauthorized();
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'helluo-somnia',
            resource_type: 'image',
        });

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            filename: result.original_filename,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
