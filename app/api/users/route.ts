import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../lib/services/multi-tenant-db';

// GET - Get all users for a tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const users = await multiTenantDb.getUsersByTenant(tenantId);
    
    // Remove sensitive information
    const safeUsers = users.map(user => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      profile: user.profile,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      security: {
        lastLogin: user.security?.lastLogin,
        twoFactorEnabled: user.security?.twoFactorEnabled
      }
    }));

    return NextResponse.json({
      success: true,
      users: safeUsers
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const { tenantId, username, email, password, firstName, lastName, role, permissions } = userData;

    if (!tenantId || !username || !email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that tenant exists
    const tenants = await multiTenantDb.getAllTenants();
    const tenant = tenants.find(t => t._id.toString() === tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid tenant ID' },
        { status: 400 }
      );
    }

    const newUser = await multiTenantDb.createUser(tenantId, {
      username,
      email,
      password, // In production, this should be hashed
      firstName,
      lastName,
      role: role || 'user',
      permissions: permissions || [],
      profile: userData.profile || {},
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          sms: false,
          push: true,
          lowStock: true,
          expiry: true,
          prescriptions: true
        }
      },
      security: {
        failedLoginAttempts: 0,
        twoFactorEnabled: false,
        recoveryTokens: []
      },
      isActive: true,
      isEmailVerified: false
    });

    // Remove sensitive information
    const safeUser = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      permissions: newUser.permissions,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}