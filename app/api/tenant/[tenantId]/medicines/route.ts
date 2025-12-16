import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../../../lib/services/multi-tenant-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock') === 'true';
    const expiring = searchParams.get('expiring') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let medicines;

    if (search) {
      medicines = await multiTenantDb.searchMedicines(tenantId, search);
    } else if (lowStock) {
      medicines = await multiTenantDb.getLowStockMedicines(tenantId);
    } else if (expiring) {
      medicines = await multiTenantDb.getExpiringMedicines(tenantId);
    } else {
      const filters: any = {};
      if (category && category !== 'all') {
        filters.category = category;
      }
      medicines = await multiTenantDb.getMedicinesByTenant(tenantId, filters);
    }

    // Apply pagination
    const paginatedMedicines = medicines.slice(offset, offset + limit);

    return NextResponse.json({
      medicines: paginatedMedicines,
      total: medicines.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const medicineData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'category', 'dosage', 'form', 'manufacturer', 'supplier', 'batchNumber'];
    for (const field of requiredFields) {
      if (!medicineData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check tenant limits
    const limits = await multiTenantDb.checkTenantLimits(tenantId);
    if (limits.medicines.exceeded) {
      return NextResponse.json(
        { error: 'Medicine limit exceeded for this subscription plan' },
        { status: 403 }
      );
    }

    const medicine = await multiTenantDb.createMedicine(tenantId, {
      ...medicineData,
      createdBy: medicineData.createdBy || tenantId,
      updatedBy: medicineData.updatedBy || tenantId
    });

    return NextResponse.json(medicine, { status: 201 });
  } catch (error) {
    console.error('Error creating medicine:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}