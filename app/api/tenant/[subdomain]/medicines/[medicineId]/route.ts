import { NextRequest, NextResponse } from 'next/server';
import { autoSaveDb } from '../../../../../../lib/services/auto-save-db';
import { MedicineRealtimeNotifier } from '../../../../../../lib/realtime-medicine-events';
import mongoose from 'mongoose';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string; medicineId: string }> }
) {
    try {
        const { subdomain, medicineId } = await params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(medicineId)) {
            return NextResponse.json({ error: 'Invalid medicine ID' }, { status: 400 });
        }

        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Auto-load medicine from MongoDB Atlas
        const medicine = await autoSaveDb.getMedicineById(medicineId, tenant._id);

        if (!medicine) {
            return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            medicine,
            message: 'Medicine auto-loaded from MongoDB Atlas'
        });

    } catch (error) {
        console.error('❌ Auto-save GET medicine operation failed:', error);
        return NextResponse.json(
            { error: 'Auto-save operation failed', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest, 
    { params }: { params: Promise<{ subdomain: string; medicineId: string }> }
) {
    try {
        const { subdomain, medicineId } = await params;
        const body = await request.json();
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(medicineId)) {
            return NextResponse.json({ error: 'Invalid medicine ID' }, { status: 400 });
        }
        
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
        
        // Check for duplicate names (excluding current medicine)
        const existingMedicines = await autoSaveDb.getMedicines(tenant._id);
        const duplicate = existingMedicines.find(med => 
            med._id.toString() !== medicineId && 
            med.name.toLowerCase() === body.name.trim().toLowerCase()
        );
        
        if (duplicate) {
            return NextResponse.json({ 
                error: 'Medicine with this name already exists' 
            }, { status: 409 });
        }
        
        // Get original medicine data for comparison
        const originalMedicine = await autoSaveDb.getMedicineById(medicineId, tenant._id);
        if (!originalMedicine) {
            return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
        }
        
        // Auto-save UPDATE to MongoDB Atlas
        const updatedMedicine = await autoSaveDb.updateMedicine(medicineId, tenant._id, {
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

        // 🚀 Trigger real-time notification for medicine update
        try {
            // Detect changed fields
            const updatedFields: any = {};
            const fieldsToCheck = ['name', 'category', 'price', 'quantity', 'expiryDate'];
            
            for (const field of fieldsToCheck) {
                if (originalMedicine[field] !== body[field]) {
                    updatedFields[field] = body[field];
                }
            }
            
            if (Object.keys(updatedFields).length > 0) {
                await MedicineRealtimeNotifier.notifyMedicineUpdated(
                    tenant._id.toString(), 
                    medicineId, 
                    updatedFields,
                    originalMedicine
                );
            }
        } catch (notificationError) {
            console.warn('⚠️ Real-time notification failed:', notificationError);
            // Don't fail the main operation if notification fails
        }
        
        return NextResponse.json({ 
            success: true, 
            medicine: updatedMedicine,
            message: 'Medicine auto-updated in MongoDB Atlas'
        });
        
    } catch (error) {
        console.error('❌ Auto-save UPDATE medicine operation failed:', error);
        return NextResponse.json({ 
            error: 'Auto-save operation failed',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ subdomain: string; medicineId: string }> }
) {
    try {
        const { subdomain, medicineId } = await params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(medicineId)) {
            return NextResponse.json({ error: 'Invalid medicine ID' }, { status: 400 });
        }
        
        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        
        // Get medicine data before deletion for notification
        const medicineToDelete = await autoSaveDb.getMedicineById(medicineId, tenant._id);
        if (!medicineToDelete) {
            return NextResponse.json({ 
                error: 'Medicine not found or already deleted' 
            }, { status: 404 });
        }
        
        // Auto-save DELETE to MongoDB Atlas (soft delete)
        const deleted = await autoSaveDb.deleteMedicine(medicineId, tenant._id);
        
        if (!deleted) {
            return NextResponse.json({ 
                error: 'Medicine not found or already deleted' 
            }, { status: 404 });
        }

        // 🚀 Trigger real-time notification for medicine deletion
        try {
            await MedicineRealtimeNotifier.notifyMedicineDeleted(tenant._id.toString(), medicineToDelete);
        } catch (notificationError) {
            console.warn('⚠️ Real-time notification failed:', notificationError);
            // Don't fail the main operation if notification fails
        }
        
        return NextResponse.json({ 
            success: true, 
            message: 'Medicine auto-deleted from MongoDB Atlas'
        });
        
    } catch (error) {
        console.error('❌ Auto-save DELETE medicine operation failed:', error);
        return NextResponse.json({ 
            error: 'Auto-save operation failed',
            details: error.message
        }, { status: 500 });
    }
}