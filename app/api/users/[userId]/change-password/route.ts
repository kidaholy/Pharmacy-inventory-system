import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../../../lib/services/multi-tenant-db';
import { PasswordUtils } from '../../../../../lib/password-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { userId } = params;
    const { tenantId, currentPassword, newPassword } = await request.json();

    if (!tenantId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Tenant ID, current password, and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordValidation = PasswordUtils.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password does not meet security requirements', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Get the user
    const user = await multiTenantDb.getUserById(tenantId, userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await PasswordUtils.verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Update password
    const success = await multiTenantDb.updateUserPassword(tenantId, userId, newPassword);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}