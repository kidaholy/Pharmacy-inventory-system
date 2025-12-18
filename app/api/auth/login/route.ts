import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../../lib/services/multi-tenant-db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Login attempt for:', email);

    // Check if this is the super admin (tenant-independent)
    if (email === 'kidayos2014@gmail.com') {
      console.log('👑 Super admin login attempt');

      // Find super admin user (any tenant or no tenant)
      const superAdminUser = await multiTenantDb.getSuperAdminByEmail(email);

      if (superAdminUser && superAdminUser.isActive) {
        // Verify password
        const isPasswordValid = await multiTenantDb.verifyUserPassword(superAdminUser, password);

        if (isPasswordValid) {
          console.log('✅ Super admin authenticated successfully');

          const authUser = {
            _id: superAdminUser._id.toString(),
            tenantId: 'super_admin', // Special identifier for super admin
            email: superAdminUser.email,
            firstName: superAdminUser.firstName,
            lastName: superAdminUser.lastName,
            role: 'super_admin',
            permissions: ['all'],
            isActive: superAdminUser.isActive
          };

          return NextResponse.json({
            success: true,
            user: authUser
          });
        }
      }

      console.log('❌ Super admin authentication failed');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // For regular users, check within tenants
    const tenants = await multiTenantDb.getAllTenants();
    console.log('📋 Found tenants:', tenants.length);

    // If no tenants exist, only super admin can login
    if (tenants.length === 0) {
      console.log('⚠️  No tenants registered. Only super admin can login.');
      return NextResponse.json(
        { success: false, error: 'No pharmacies registered yet. Please register your pharmacy first or contact the system administrator.' },
        { status: 401 }
      );
    }

    for (const tenant of tenants) {
      console.log('🔍 Checking tenant:', tenant.name, 'ID:', tenant._id.toString());

      try {
        const user = await multiTenantDb.getUserByCredentials(tenant._id.toString(), email, password);
        console.log('👤 getUserByCredentials result:', user ? 'USER FOUND' : 'NO USER');

        if (user && user.isActive) {
          console.log('✅ User found and authenticated:', user.email);

          // Convert MongoDB user to our User interface
          const authUser = {
            _id: user._id.toString(),
            tenantId: user.tenantId.toString(),
            tenantSubdomain: tenant.subdomain, // Add subdomain for API calls
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            permissions: user.permissions || [],
            isActive: user.isActive
          };

          return NextResponse.json({
            success: true,
            user: authUser
          });
        } else {
          console.log('❌ User not found or inactive for tenant:', tenant.name);
        }
      } catch (error) {
        console.error('❌ Error checking tenant:', tenant.name, error instanceof Error ? error.message : String(error));
      }
    }

    console.log('❌ Authentication failed for:', email);
    return NextResponse.json(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    );

  } catch (error) {
    console.error('❌ Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}