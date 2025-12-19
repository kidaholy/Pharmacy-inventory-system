import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../../lib/services/multi-tenant-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenantId } = resolvedParams;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Identify tenant
    let tenant = await multiTenantDb.getTenantBySubdomain(tenantId);
    if (!tenant) {
      tenant = await multiTenantDb.getTenantById(tenantId);
    }

    if (!tenant) {
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenantId } = resolvedParams;
    const body = await request.json();

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }

    // Identify tenant
    let tenant = await multiTenantDb.getTenantBySubdomain(tenantId);
    if (!tenant) {
      tenant = await multiTenantDb.getTenantById(tenantId);
    }

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Update settings (specifically branding)
    const updatedTenant = await multiTenantDb.updateTenant(tenant._id.toString(), body);

    return NextResponse.json({ success: true, tenant: updatedTenant });
  } catch (error) {
    console.error('❌ Error updating tenant:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}