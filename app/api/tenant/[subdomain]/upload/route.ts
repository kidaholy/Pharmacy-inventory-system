import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const { subdomain } = await params;
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type (basic)
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Create unique filename
        const extension = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${extension}`;

        // Define storage path
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tenants', subdomain);
        const filePath = path.join(uploadDir, fileName);

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // Write file
        await writeFile(filePath, buffer);

        // Return the public URL
        const publicUrl = `/uploads/tenants/${subdomain}/${fileName}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            name: file.name
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload image', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
