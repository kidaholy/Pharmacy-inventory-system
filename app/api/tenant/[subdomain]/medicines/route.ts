import { NextRequest, NextResponse } from 'next/server';
import { autoSaveDb } from '../../../../../lib/services/auto-save-db';
import { MedicineRealtimeNotifier } from '../../../../../lib/realtime-medicine-events';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const { subdomain } = await params;
        const { searchParams } = new URL(request.url);
        
        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Extract query parameters for filtering
        const filters: any = {};
        if (searchParams.get('category')) filters.category = searchParams.get('category');
        if (searchParams.get('search')) filters.search = searchParams.get('search');
        if (searchParams.get('lowStock') === 'true') filters.lowStock = true;
        if (searchParams.get('expiring') === 'true') filters.expiring = true;
        if (searchParams.get('limit')) filters.limit = parseInt(searchParams.get('limit') || '100');
        if (searchParams.get('offset')) filters.offset = parseInt(searchParams.get('offset') || '0');

        // Auto-load medicines from MongoDB Atlas
        const medicines = await autoSaveDb.getMedicines(tenant._id, filters);

        return NextResponse.json({
            success: true,
            medicines,
            message: `Auto-loaded ${medicines.length} medicines from MongoDB Atlas`
        });

    } catch (error) {
        console.error('❌ Auto-save GET medicines operation failed:', error);
        return NextResponse.json(
            { error: 'Auto-save operation failed', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const { subdomain } = await params;
        const body = await request.json();

        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Validate required fields
        const requiredFields = ['name', 'category', 'price', 'quantity', 'expiryDate'];
        for (const field of requiredFields) {
            if (!body[field] && body[field] !== 0) {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Validate numeric fields
        if (isNaN(body.price) || body.price < 0) {
            return NextResponse.json(
                { error: 'Price must be a valid positive number' },
                { status: 400 }
            );
        }

        if (isNaN(body.quantity) || body.quantity < 0) {
            return NextResponse.json(
                { error: 'Quantity must be a valid positive number' },
                { status: 400 }
            );
        }

        // Validate expiry date
        const expiryDate = new Date(body.expiryDate);
        if (isNaN(expiryDate.getTime())) {
            return NextResponse.json(
                { error: 'Invalid expiry date' },
                { status: 400 }
            );
        }

        if (expiryDate <= new Date()) {
            return NextResponse.json(
                { error: 'Expiry date must be in the future' },
                { status: 400 }
            );
        }

        // Check for duplicate medicine names
        const existingMedicines = await autoSaveDb.getMedicines(tenant._id);
        const duplicate = existingMedicines.find(med => 
            med.name.toLowerCase() === body.name.trim().toLowerCase()
        );

        if (duplicate) {
            return NextResponse.json(
                { error: 'Medicine with this name already exists' },
                { status: 409 }
            );
        }

        // Auto-save CREATE to MongoDB Atlas
        const medicine = await autoSaveDb.createMedicine(tenant._id, {
            name: body.name.trim(),
            genericName: body.genericName?.trim(),
            brandName: body.brandName?.trim(),
            category: body.category,
            subcategory: body.subcategory?.trim(),
            description: body.description?.trim(),
            dosage: body.dosage?.trim() || 'As directed',
            strength: body.strength?.trim(),
            form: body.form || 'tablet',
            manufacturer: body.manufacturer?.trim() || 'Unknown',
            supplier: body.supplier?.trim() || 'Unknown',
            batchNumber: body.batchNumber?.trim() || `BATCH-${Date.now()}`,
            barcode: body.barcode?.trim(),
            sku: body.sku?.trim(),
            quantity: body.quantity,
            reorderLevel: body.reorderLevel || 10,
            price: body.price,
            costPrice: body.costPrice || body.price,
            mrp: body.mrp || body.price,
            discount: body.discount || 0,
            tax: body.tax || 0,
            expiryDate: body.expiryDate,
            manufactureDate: body.manufactureDate,
            receivedDate: body.receivedDate,
            storageLocation: body.storageLocation,
            rackNumber: body.rackNumber,
            storageConditions: body.storageConditions || 'room temperature',
            humidity: body.humidity,
            storageInstructions: body.storageInstructions,
            drugLicenseNumber: body.drugLicenseNumber,
            scheduleType: body.scheduleType,
            prescriptionRequired: body.prescriptionRequired || false,
            controlledSubstance: body.controlledSubstance || false,
            composition: body.composition,
            sideEffects: body.sideEffects,
            contraindications: body.contraindications,
            interactions: body.interactions,
            warnings: body.warnings,
            images: body.images,
            documents: body.documents,
            tags: body.tags
        });

        // 🚀 Trigger real-time notification for medicine creation
        try {
            await MedicineRealtimeNotifier.notifyMedicineCreated(tenant._id.toString(), medicine);
        } catch (notificationError) {
            console.warn('⚠️ Real-time notification failed:', notificationError);
            // Don't fail the main operation if notification fails
        }

        return NextResponse.json({
            success: true,
            medicine,
            message: 'Medicine auto-saved to MongoDB Atlas'
        }, { status: 201 });

    } catch (error) {
        console.error('❌ Auto-save POST medicines operation failed:', error);
        return NextResponse.json(
            { error: 'Auto-save operation failed', details: error.message },
            { status: 500 }
        );
    }
}