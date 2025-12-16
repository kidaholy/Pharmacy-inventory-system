import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../../lib/services/multi-tenant-db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Checking database connection...');
    
    // Get environment info
    const mongoUri = process.env.MONGODB_URI;
    const hasMongoUri = !!mongoUri;
    const mongoUriPreview = mongoUri ? `${mongoUri.substring(0, 20)}...` : 'NOT SET';
    
    console.log('Environment check:', {
      hasMongoUri,
      mongoUriPreview,
      nodeEnv: process.env.NODE_ENV
    });
    
    // Try to get tenants
    let tenants = [];
    let users = [];
    let error = null;
    
    try {
      tenants = await multiTenantDb.getAllTenants();
      console.log('✅ Tenants found:', tenants.length);
      
      // Try to get users
      if (tenants.length > 0) {
        for (const tenant of tenants) {
          const tenantUsers = await multiTenantDb.getUsersByTenant(tenant._id.toString());
          users.push(...tenantUsers);
        }
      }
      
      // Also check for super admin
      const superAdmin = await multiTenantDb.getSuperAdminByEmail('kidayos2014@gmail.com');
      if (superAdmin) {
        users.push(superAdmin);
      }
      
      console.log('✅ Users found:', users.length);
      
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      error = dbError.message;
    }
    
    return NextResponse.json({
      success: true,
      environment: {
        hasMongoUri,
        mongoUriPreview,
        nodeEnv: process.env.NODE_ENV
      },
      database: {
        tenantsCount: tenants.length,
        usersCount: users.length,
        tenants: tenants.map(t => ({
          id: t._id.toString(),
          name: t.name,
          subdomain: t.subdomain,
          active: t.isActive
        })),
        users: users.map(u => ({
          id: u._id.toString(),
          email: u.email,
          role: u.role,
          active: u.isActive,
          tenantId: u.tenantId?.toString() || null
        })),
        error
      }
    });
    
  } catch (error) {
    console.error('❌ Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      environment: {
        hasMongoUri: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}