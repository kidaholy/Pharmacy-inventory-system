import { NextRequest, NextResponse } from 'next/server';
import { autoSaveDb } from '../../../../../../lib/services/auto-save-db';
import mongoose from 'mongoose';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string; categoryId: string }> }
) {
    try {
        const { subdomain, categoryId } = await params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
        }

        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Auto-load categories and find the specific one
        const categories = await autoSaveDb.getCategories(tenant._id);
        const category = categories.find(cat => cat._id.toString() === categoryId);

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            category,
            message: 'Category auto-loaded from MongoDB Atlas'
        });

    } catch (error) {
        console.error('❌ Auto-save GET operation failed:', error);
        return NextResponse.json(
            { error: 'Auto-save operation failed', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest, 
    { params }: { params: Promise<{ subdomain: string; categoryId: string }> }
) {
    try {
        const { subdomain, categoryId } = await params;
        const body = await request.json();
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
        }
        
        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        
        // Validate required fields
        if (!body.name || !body.name.trim()) {
            return NextResponse.json({ 
                error: 'Category name is required' 
            }, { status: 400 });
        }
        
        // Check for duplicate names (excluding current category)
        const existingCategories = await autoSaveDb.getCategories(tenant._id);
        const duplicate = existingCategories.find(cat => 
            cat._id.toString() !== categoryId && 
            cat.name.toLowerCase() === body.name.trim().toLowerCase()
        );
        
        if (duplicate) {
            return NextResponse.json({ 
                error: 'Category with this name already exists' 
            }, { status: 409 });
        }
        
        // Auto-save UPDATE to MongoDB Atlas
        const updatedCategory = await autoSaveDb.updateCategory(categoryId, tenant._id, {
            name: body.name.trim(),
            description: body.description?.trim() || '',
            color: body.color?.trim() || '#6b7280',
            icon: body.icon?.trim() || ''
        });
        
        return NextResponse.json({ 
            success: true, 
            category: updatedCategory,
            message: 'Category auto-updated in MongoDB Atlas'
        });
        
    } catch (error) {
        console.error('❌ Auto-save UPDATE operation failed:', error);
        return NextResponse.json({ 
            error: 'Auto-save operation failed',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ subdomain: string; categoryId: string }> }
) {
    try {
        const { subdomain, categoryId } = await params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
        }
        
        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        
        // Auto-save DELETE to MongoDB Atlas (soft delete)
        const deleted = await autoSaveDb.deleteCategory(categoryId, tenant._id);
        
        if (!deleted) {
            return NextResponse.json({ 
                error: 'Category not found or already deleted' 
            }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true, 
            message: 'Category auto-deleted in MongoDB Atlas'
        });
        
    } catch (error) {
        console.error('❌ Auto-save DELETE operation failed:', error);
        return NextResponse.json({ 
            error: 'Auto-save operation failed',
            details: error.message
        }, { status: 500 });
    }
}