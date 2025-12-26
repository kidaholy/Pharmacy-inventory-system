import { NextRequest, NextResponse } from 'next/server';
import { autoSaveDb } from '../../../../../../lib/services/auto-save-db';
import mongoose from 'mongoose';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string; userId: string }> }
) {
    try {
        const { subdomain, userId } = await params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Auto-load user from MongoDB Atlas
        const user = await autoSaveDb.getUserById(tenant._id.toString(), userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Remove password from response
        const { password, ...userResponse } = user;

        return NextResponse.json({
            success: true,
            user: userResponse,
            message: 'User auto-loaded from MongoDB Atlas'
        });

    } catch (error) {
        console.error('❌ Auto-save GET user operation failed:', error);
        return NextResponse.json(
            { error: 'Auto-save operation failed', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest, 
    { params }: { params: Promise<{ subdomain: string; userId: string }> }
) {
    try {
        const { subdomain, userId } = await params;
        const body = await request.json();
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }
        
        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        
        // Validate required fields
        const requiredFields = ['username', 'email'];
        for (const field of requiredFields) {
            if (!body[field] || !body[field].trim()) {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }
        
        // Check for duplicate username/email (excluding current user)
        const existingUsers = await autoSaveDb.getUsersByTenant(tenant._id.toString());
        const duplicateUsername = existingUsers.find(user => 
            user._id.toString() !== userId && 
            user.username.toLowerCase() === body.username.trim().toLowerCase()
        );
        const duplicateEmail = existingUsers.find(user => 
            user._id.toString() !== userId && 
            user.email.toLowerCase() === body.email.trim().toLowerCase()
        );
        
        if (duplicateUsername) {
            return NextResponse.json({ 
                error: 'Username already exists' 
            }, { status: 409 });
        }

        if (duplicateEmail) {
            return NextResponse.json({ 
                error: 'Email already exists' 
            }, { status: 409 });
        }
        
        // Prepare update data
        const updateData = {
            username: body.username.trim(),
            email: body.email.trim().toLowerCase(),
            firstName: body.firstName?.trim() || '',
            lastName: body.lastName?.trim() || '',
            role: body.role || 'user',
            permissions: body.permissions || [],
            profile: {
                phone: body.phone?.trim() || '',
                address: body.address?.trim() || '',
                dateOfBirth: body.dateOfBirth || null,
                gender: body.gender || '',
                profilePicture: body.profilePicture || ''
            },
            preferences: {
                language: body.language || 'en',
                timezone: body.timezone || 'UTC',
                notifications: {
                    email: body.emailNotifications !== false,
                    sms: body.smsNotifications || false,
                    push: body.pushNotifications !== false
                }
            }
        };

        // Add password if provided
        if (body.password && body.password.trim()) {
            updateData.password = body.password; // In production, hash this
        }
        
        // Auto-save UPDATE to MongoDB Atlas
        const updatedUser = await autoSaveDb.updateUser(tenant._id.toString(), userId, updateData);
        
        // Remove password from response
        const { password, ...userResponse } = updatedUser;
        
        return NextResponse.json({ 
            success: true, 
            user: userResponse,
            message: 'User auto-updated in MongoDB Atlas'
        });
        
    } catch (error) {
        console.error('❌ Auto-save UPDATE user operation failed:', error);
        return NextResponse.json({ 
            error: 'Auto-save operation failed',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ subdomain: string; userId: string }> }
) {
    try {
        const { subdomain, userId } = await params;
        const { searchParams } = new URL(request.url);
        const permanent = searchParams.get('permanent') === 'true';
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }
        
        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        
        let deleted: boolean;
        let message: string;
        
        if (permanent) {
            // Permanent deletion
            deleted = await autoSaveDb.deleteUserPermanently(tenant._id.toString(), userId);
            message = 'User permanently auto-deleted from MongoDB Atlas';
        } else {
            // Soft deletion (deactivation)
            deleted = await autoSaveDb.softDeleteUser(tenant._id.toString(), userId);
            message = 'User auto-deactivated in MongoDB Atlas';
        }
        
        if (!deleted) {
            return NextResponse.json({ 
                error: 'User not found or already deleted' 
            }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true, 
            message,
            permanent
        });
        
    } catch (error) {
        console.error('❌ Auto-save DELETE user operation failed:', error);
        return NextResponse.json({ 
            error: 'Auto-save operation failed',
            details: error.message
        }, { status: 500 });
    }
}