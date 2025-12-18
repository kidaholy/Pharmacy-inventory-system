import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../lib/services/multi-tenant-db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🧪 Test login for:', email);
    
    // Get all tenants
    const tenants = await multiTenantDb.getAllTenants();
    console.log('📋 Found tenants:', tenants.length);
    
    for (const tenant of tenants) {
      console.log('🔍 Testing tenant:', tenant.name);
      const user = await multiTenantDb.getUserByCredentials(tenant._id.toString(), email, password);
      
      if (user && user.isActive) {
        console.log('✅ Test login SUCCESS');
        return NextResponse.json({
          success: true,
          message: 'Login test successful',
          tenant: tenant.name,
          user: {
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
          }
        });
      }
    }
    
    console.log('❌ Test login FAILED');
    return NextResponse.json({
      success: false,
      message: 'Login test failed'
    }, { status: 401 });
    
  } catch (error) {
    console.error('❌ Test login error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}