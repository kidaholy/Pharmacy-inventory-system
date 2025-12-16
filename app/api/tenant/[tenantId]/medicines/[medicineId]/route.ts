import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../../../../lib/services/multi-tenant-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; medicineId: string }> }
) {
  try {
    const { tenantId, medicineId } = await params;
    const { tenantId, medicineId } = params;
    
    const medicine = await multiTenantDb.getMedicineById(tenantId, medicineId);
    
    if (!medicine) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(medicine);
  } catch (error) {
    console.error('Error fetching medicine:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; medicineId: string }> }
) {
  try {
    const { tenantId, medicineId } = await params;
    const { tenantId, medicineId } = params;
    const updates = await request.json();

    const medicine = await multiTenantDb.updateMedicine(tenantId, medicineId, {
      ...updates,
      updatedBy: updates.updatedBy || tenantId
    });

    if (!medicine) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(medicine);
  } catch (error) {
    console.error('Error updating medicine:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; medicineId: string }> }
) {
  try {
    const { tenantId, medicineId } = await params;
    const { tenantId, medicineId } = params;
    
    const success = await multiTenantDb.deleteMedicine(tenantId, medicineId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}