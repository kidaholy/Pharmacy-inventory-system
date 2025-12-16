import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../../../lib/services/multi-tenant-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenantId } = resolvedParams;
    
    console.log('📊 Loading stats for tenant:', tenantId);

    // First, resolve subdomain to tenant ID if needed
    let actualTenantId = tenantId;
    
    // Try to get tenant by subdomain first (if tenantId is actually a subdomain)
    let tenant = await multiTenantDb.getTenantBySubdomain(tenantId);
    
    // If not found by subdomain, try by actual tenant ID
    if (!tenant) {
      tenant = await multiTenantDb.getTenantById(tenantId);
    }
    
    if (!tenant) {
      console.log('❌ Tenant not found for:', tenantId);
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    // Use the actual tenant ID for stats
    actualTenantId = tenant._id.toString();
    console.log('📊 Using tenant ID for stats:', actualTenantId);

    // Get tenant stats using the actual tenant ID
    const stats = await multiTenantDb.getTenantStats(actualTenantId);
    
    console.log('✅ Stats loaded:', stats);

    return NextResponse.json(stats);

  } catch (error) {
    console.error('❌ Error loading tenant stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load statistics',
        // Return default stats on error
        totalMedicines: 0,
        totalUsers: 1,
        lowStockCount: 0,
        expiringCount: 0,
        pendingPrescriptions: 0,
        totalInventoryValue: 0
      },
      { status: 500 }
    );
  }
}