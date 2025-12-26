import { NextRequest, NextResponse } from 'next/server';
import { autoSaveDb } from '../../../../../lib/services/auto-save-db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const { subdomain } = await params;
        const { searchParams } = new URL(request.url);
        
        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Extract query parameters for filtering
        const filters: any = {};
        if (searchParams.get('role')) filters.role = searchParams.get('role');
        if (searchParams.get('search')) filters.search = searchParams.get('search');
        if (searchParams.get('isEmailVerified')) filters.isEmailVerified = searchParams.get('isEmailVerified') === 'true';
        if (searchParams.get('limit')) filters.limit = parseInt(searchParams.get('limit') || '100');
        if (searchParams.get('offset')) filters.offset = parseInt(searchParams.get('offset') || '0');

        // Auto-load users from MongoDB Atlas
        const users = await autoSaveDb.getUsersByTenant(tenant._id.toString());

        // Apply client-side filtering for now (can be moved to DB later)
        let filteredUsers = users;
        
        if (filters.role) {
            filteredUsers = filteredUsers.filter(user => user.role === filters.role);
        }
        
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredUsers = filteredUsers.filter(user => 
                user.username?.toLowerCase().includes(searchLower) ||
                user.email?.toLowerCase().includes(searchLower) ||
                user.firstName?.toLowerCase().includes(searchLower) ||
                user.lastName?.toLowerCase().includes(searchLower)
            );
        }
        
        if (filters.isEmailVerified !== undefined) {
            filteredUsers = filteredUsers.filter(user => user.isEmailVerified === filters.isEmailVerified);
        }

        // Apply pagination
        const startIndex = filters.offset || 0;
        const endIndex = startIndex + (filters.limit || 100);
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        return NextResponse.json({
            success: true,
            users: paginatedUsers,
            total: filteredUsers.length,
            message: `Auto-loaded ${paginatedUsers.length} users from MongoDB Atlas`
        });

    } catch (error) {
        console.error('❌ Auto-save GET users operation failed:', error);
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
        const requiredFields = ['username', 'email', 'password'];
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

        // Check for duplicate username/email
        const existingUsers = await autoSaveDb.getUsersByTenant(tenant._id.toString());
        const duplicateUsername = existingUsers.find(user => 
            user.username.toLowerCase() === body.username.trim().toLowerCase()
        );
        const duplicateEmail = existingUsers.find(user => 
            user.email.toLowerCase() === body.email.trim().toLowerCase()
        );

        if (duplicateUsername) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 409 }
            );
        }

        if (duplicateEmail) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }

        // Auto-save CREATE to MongoDB Atlas
        const user = await autoSaveDb.createUser(tenant._id.toString(), {
            username: body.username.trim(),
            email: body.email.trim().toLowerCase(),
            password: body.password, // In production, hash this
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
        });

        // Remove password from response
        const { password, ...userResponse } = user.toObject ? user.toObject() : user;

        return NextResponse.json({
            success: true,
            user: userResponse,
            message: 'User auto-saved to MongoDB Atlas'
        }, { status: 201 });

    } catch (error) {
        console.error('❌ Auto-save POST users operation failed:', error);
        return NextResponse.json(
            { error: 'Auto-save operation failed', details: error.message },
            { status: 500 }
        );
    }
}