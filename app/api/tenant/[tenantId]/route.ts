import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../../lib/services/multi-tenant-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    console.log('🔍 Tenant API called with params:', params);
    const { tenantId } = params;
    
    if (!tenantId) {
      console.log('❌ No tenantId provided');
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Looking up tenant:', tenantId);
    
    // Try to get tenant by subdomain first (if tenantId is actually a subdomain)
    let tenant = await multiTenantDb.getTenantBySubdomain(tenantId);
    console.log('🔍 Tenant by subdomain:', tenant ? 'Found' : 'Not found');
    
    // If not found by subdomain, try by actual tenant ID
    if (!tenant) {
      tenant = await multiTenantDb.getTenantById(tenantId);
      console.log('🔍 Tenant by ID:', tenant ? 'Found' : 'Not found');
    }
    
    if (!tenant) {
      console.log('❌ Tenant not found for:', tenantId);
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Don't return sensitive information
    const safeTenant = {
      _id: tenant._id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      subscriptionPlan: tenant.subscriptionPlan,
      subscriptionStatus: tenant.subscriptionStatus,
      settings: tenant.settings,
      contact: {
        email: tenant.contact.email,
        phone: tenant.contact.phone,
        city: tenant.contact.city,
        country: tenant.contact.country
      },
      isActive: tenant.isActive,
      createdAt: tenant.createdAt
    };

    return NextResponse.json(safeTenant);
  } catch (error) {
    console.error('❌ Error fetching tenant:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}