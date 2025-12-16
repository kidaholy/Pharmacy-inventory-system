import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../lib/services/multi-tenant-db';

export async function GET() {
  try {
    const tenants = await multiTenantDb.getAllTenants();
    
    return NextResponse.json({
      success: true,
      tenants: tenants
    });

  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}