import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../../lib/services/multi-tenant-db';

// GET - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const user = await multiTenantDb.getUserById(tenantId, userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove sensitive information
    const safeUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      profile: user.profile,
      preferences: user.preferences,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      security: {
        lastLogin: user.security?.lastLogin,
        twoFactorEnabled: user.security?.twoFactorEnabled
      }
    };

    return NextResponse.json({
      success: true,
      user: safeUser
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const updateData = await request.json();
    const { tenantId } = updateData;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Get the user to be updated
    const userToUpdate = await multiTenantDb.getUserById(tenantId, userId);
    if (!userToUpdate) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Protect super admin from deactivation
    if (userToUpdate.email === 'kidayos2014@gmail.com' && updateData.isActive === false) {
      return NextResponse.json(
        { error: 'Cannot deactivate the super admin user.' },
        { status: 400 }
      );
    }

    // If trying to deactivate an admin user, check if it's the last admin
    if (updateData.isActive === false && 
        (userToUpdate.role === 'admin' || userToUpdate.role === 'tenant_admin' || userToUpdate.role === 'super_admin')) {
      
      const allUsers = await multiTenantDb.getUsersByTenant(tenantId);
      const activeAdminUsers = allUsers.filter(u => 
        u.isActive && 
        u._id.toString() !== userId && // Exclude the user being updated
        (u.role === 'admin' || u.role === 'tenant_admin' || u.role === 'super_admin')
      );

      if (activeAdminUsers.length === 0) {
        return NextResponse.json(
          { error: 'Cannot deactivate the last admin user. Each tenant must have at least one active admin.' },
          { status: 400 }
        );
      }
    }

    // Remove tenantId from update data to prevent changing it
    delete updateData.tenantId;
    
    // Don't allow updating password through this endpoint
    delete updateData.password;

    const updatedUser = await multiTenantDb.updateUser(tenantId, userId, updateData);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove sensitive information
    const safeUser = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      permissions: updatedUser.permissions,
      profile: updatedUser.profile,
      isActive: updatedUser.isActive,
      updatedAt: updatedUser.updatedAt
    };

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete (deactivate) a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log('🗑️ Delete user request:', { userId });
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    console.log('🔍 Delete user params:', { userId, tenantId });

    if (!tenantId) {
      console.log('❌ Missing tenant ID');
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Get the user to be deleted
    console.log('🔍 Looking up user to delete...');
    const userToDelete = await multiTenantDb.getUserById(tenantId, userId);
    console.log('👤 User to delete:', userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName} (${userToDelete.role})` : 'Not found');
    
    if (!userToDelete) {
      console.log('❌ User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Protect super admin from deletion
    if (userToDelete.email === 'kidayos2014@gmail.com') {
      console.log('🔒 Attempted to delete super admin');
      return NextResponse.json(
        { error: 'Cannot delete the super admin user.' },
        { status: 400 }
      );
    }

    // Check if this is an admin user
    if (userToDelete.role === 'admin' || userToDelete.role === 'tenant_admin' || userToDelete.role === 'super_admin') {
      console.log('🔍 User is admin, checking if last admin...');
      
      // Get ALL users for this tenant (including inactive ones)
      const allUsers = await multiTenantDb.getAllUsersByTenant(tenantId);
      console.log('📋 All users in tenant:', allUsers.length);
      
      const activeAdminUsers = allUsers.filter(u => 
        u.isActive && 
        u._id.toString() !== userId && // Exclude the user being deleted
        (u.role === 'admin' || u.role === 'tenant_admin' || u.role === 'super_admin')
      );
      
      console.log('👑 Other active admin users:', activeAdminUsers.length);
      activeAdminUsers.forEach(admin => {
        console.log(`   - ${admin.firstName} ${admin.lastName} (${admin.email}) - ${admin.role}`);
      });

      // Prevent deleting the last admin user
      if (activeAdminUsers.length === 0) {
        console.log('❌ Cannot delete last admin user');
        return NextResponse.json(
          { error: 'Cannot delete the last admin user. Each tenant must have at least one admin.' },
          { status: 400 }
        );
      }
    }

    console.log('🗑️ Proceeding with user deletion...');
    const success = await multiTenantDb.deleteUser(tenantId, userId);
    console.log('🗑️ Delete result:', success);

    if (!success) {
      console.log('❌ Delete operation failed');
      return NextResponse.json(
        { error: 'User deletion failed - user may not exist or database error occurred' },
        { status: 500 }
      );
    }

    console.log('✅ User deleted successfully');
    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to delete user', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}