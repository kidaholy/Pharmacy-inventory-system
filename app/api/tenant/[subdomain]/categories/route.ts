import { NextRequest, NextResponse } from 'next/server';
import { autoSaveDb } from '../../../../../lib/services/auto-save-db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const { subdomain } = await params;

        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Auto-load categories from MongoDB Atlas
        const categories = await autoSaveDb.getCategories(tenant._id);

        return NextResponse.json({
            success: true,
            categories,
            message: `Auto-loaded ${categories.length} categories from MongoDB Atlas`
        });

    } catch (error) {
        console.error('❌ Auto-save GET operation failed:', error);
        return NextResponse.json(
            { error: 'Auto-save operation failed', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const { subdomain } = await params;
        const body = await request.json();

        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Validate required fields
        if (!body.name || !body.name.trim()) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        // Check for duplicates
        const existingCategories = await autoSaveDb.getCategories(tenant._id);
        const duplicate = existingCategories.find(cat => 
            cat.name.toLowerCase() === body.name.trim().toLowerCase()
        );

        if (duplicate) {
            return NextResponse.json(
                { error: 'Category with this name already exists' },
                { status: 409 }
            );
        }

        // Auto-save CREATE to MongoDB Atlas
        const category = await autoSaveDb.createCategory(tenant._id, {
            name: body.name.trim(),
            description: body.description?.trim() || '',
            color: body.color?.trim() || '#6b7280',
            icon: body.icon?.trim() || ''
        });

        return NextResponse.json({
            success: true,
            category,
            message: 'Category auto-saved to MongoDB Atlas'
        }, { status: 201 });

    } catch (error) {
        console.error('❌ Auto-save POST operation failed:', error);
        return NextResponse.json(
            { error: 'Auto-save operation failed', details: error.message },
            { status: 500 }
        );
    }
}
