import { NextRequest, NextResponse } from 'next/server';
import { autoSaveDb } from '../../../../../../../lib/services/auto-save-db';
import mongoose from 'mongoose';

export async function PATCH(
    request: NextRequest, 
    { params }: { params: Promise<{ subdomain: string; medicineId: string }> }
) {
    try {
        const { subdomain, medicineId } = await params;
        const body = await request.json();
        
        console.log('🚀 Quick update initiated for medicine:', medicineId);
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(medicineId)) {
            return NextResponse.json({ error: 'Invalid medicine ID' }, { status: 400 });
        }
        
        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        
        // Get current medicine for comparison
        const currentMedicine = await autoSaveDb.getMedicineById(medicineId, tenant._id);
        if (!currentMedicine) {
            return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
        }
        
        // Prepare update data with only changed fields
        const updateData: any = {};
        
        // Check each field for changes and only update what's different
        if (body.name && body.name !== currentMedicine.name) {
            updateData.name = body.name.trim();
        }
        if (body.quantity !== undefined && body.quantity !== (currentMedicine.stock?.current || currentMedicine.quantity)) {
            updateData.quantity = parseInt(body.quantity);
        }
        if (body.price !== undefined && body.price !== (currentMedicine.pricing?.sellingPrice || currentMedicine.price)) {
            updateData.price = parseFloat(body.price);
        }
        if (body.category && body.category !== currentMedicine.category) {
            updateData.category = body.category;
        }
        if (body.expiryDate && body.expiryDate !== (currentMedicine.dates?.expiryDate || currentMedicine.expiryDate)) {
            updateData.expiryDate = body.expiryDate;
        }
        
        // If no changes, return current medicine
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({
                success: true,
                medicine: currentMedicine,
                message: '✅ No changes detected - medicine is up to date',
                changed: false
            });
        }
        
        console.log('📝 Fields being updated:', Object.keys(updateData));
        
        // Perform immediate update to MongoDB Atlas
        const updatedMedicine = await autoSaveDb.updateMedicine(medicineId, tenant._id, {
            ...currentMedicine,
            ...updateData
        });
        
        console.log('✅ Quick update completed in MongoDB Atlas');
        
        return NextResponse.json({ 
            success: true, 
            medicine: updatedMedicine,
            message: `✅ Medicine instantly updated in MongoDB Atlas (${Object.keys(updateData).length} fields changed)`,
            changed: true,
            updatedFields: Object.keys(updateData),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Quick update failed:', error);
        return NextResponse.json({ 
            error: 'Quick update failed',
            details: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}