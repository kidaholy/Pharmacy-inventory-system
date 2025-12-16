import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../../lib/services/multi-tenant-db';

// GET - Get a specific tenant
export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const tenant = await multiTenantDb.getTenantById(tenantId);

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tenant: tenant
    });

  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenant' },
      { status: 500 }
    );
  }
}

// PUT - Update a tenant
export async function PUT(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const updateData = await request.json();

    // Get the tenant to check if it's the demo tenant
    const tenant = await multiTenantDb.getTenantById(tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // No special protection needed - all tenants can be managed

    const updatedTenant = await multiTenantDb.updateTenant(tenantId, updateData);

    if (!updatedTenant) {
      return NextResponse.json(
        { error: 'Failed to update tenant' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tenant: updatedTenant,
      message: 'Tenant updated successfully'
    });

  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json(
      { error: 'Failed to update tenant' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a tenant (protected for demo)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;

    // Get the tenant to check if it's the demo tenant
    const tenant = await multiTenantDb.getTenantById(tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // All tenants can be deleted (except through business rules)

    // In a real implementation, you'd want to also delete all users, medicines, etc.
    // For now, we'll just mark the tenant as inactive
    const updatedTenant = await multiTenantDb.updateTenant(tenantId, { isActive: false });

    if (!updatedTenant) {
      return NextResponse.json(
        { error: 'Failed to delete tenant' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tenant deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json(
      { error: 'Failed to delete tenant' },
      { status: 500 }
    );
  }
}