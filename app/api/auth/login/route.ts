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

    // Get all tenants to find the user
    const tenants = await multiTenantDb.getAllTenants();
    console.log('📋 Found tenants:', tenants.length);

    for (const tenant of tenants) {
      console.log('🔍 Checking tenant:', tenant.name);
      const user = await multiTenantDb.getUserByCredentials(tenant._id.toString(), email, password);
      
      if (user && user.isActive) {
        console.log('✅ User found and authenticated:', user.email);
        
        // Convert MongoDB user to our User interface
        const authUser = {
          _id: user._id.toString(),
          tenantId: user.tenantId.toString(),
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