import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../../../lib/services/multi-tenant-db';
import mongoose from 'mongoose';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        await multiTenantDb.ensureConnection();
        
        const { userId } = await params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ 
                error: 'Invalid user ID' 
            }, { status: 400 });
        }
        
        console.log('🗑️ Starting hard delete process for user:', userId);
        
        // Get user details before deletion for logging
        const user = await multiTenantDb.getUserById(userId);
        if (!user) {
            return NextResponse.json({ 
                error: 'User not found' 
            }, { status: 404 });
        }
        
        // Check if user is the last admin of a tenant
        if (user.role === 'admin' || user.role === 'tenant_admin') {
            // Check if this is the only admin for their tenant
            const tenantAdmins = await multiTenantDb.getUsersByTenant(user.tenantId || '');
            const adminCount = tenantAdmins.filter(u => 
                (u.role === 'admin' || u.role === 'tenant_admin') && 
                u.isActive && 
                u.id !== userId
            ).length;
            
            if (adminCount === 0 && user.tenantId) {
                return NextResponse.json({ 
                    error: 'Cannot delete the last admin of a tenant. Please assign another admin first.' 
                }, { status: 409 });
            }
        }
        
        // Perform hard delete - this will permanently remove the user
        const deleted = await multiTenantDb.hardDeleteUser(userId);
        
        if (!deleted) {
            return NextResponse.json({ 
                error: 'Failed to delete user' 
            }, { status: 500 });
        }
        
        console.log('✅ User permanently deleted from MongoDB Atlas:', user.username);
        
        return NextResponse.json({ 
            success: true, 
            message: `User "${user.username}" permanently deleted from MongoDB Atlas`,
            deletedUser: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('❌ Hard delete operation failed:', error);
        return NextResponse.json({ 
            error: 'Hard delete operation failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}