import { NextRequest, NextResponse } from 'next/server';
import { autoSaveDb } from '../../../../../../lib/services/auto-save-db';
import mongoose from 'mongoose';

// Real-time update endpoint with immediate feedback
export async function PATCH(
    request: NextRequest, 
    { params }: { params: Promise<{ subdomain: string; medicineId: string }> }
) {
    try {
        const { subdomain, medicineId } = await params;
        const body = await request.json();
        
        console.log('⚡ Real-time update initiated for medicine:', medicineId);
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(medicineId)) {
            return NextResponse.json({ 
                error: 'Invalid medicine ID',
                status: 'error',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }
        
        // Auto-load tenant from MongoDB Atlas
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ 
                error: 'Tenant not found',
                status: 'error',
                timestamp: new Date().toISOString()
            }, { status: 404 });
        }
        
        // Get current medicine for comparison
        const currentMedicine = await autoSaveDb.getMedicineById(medicineId, tenant._id);
        if (!currentMedicine) {
            return NextResponse.json({ 
                error: 'Medicine not found',
                status: 'error',
                timestamp: new Date().toISOString()
            }, { status: 404 });
        }
        
        // Prepare update data with detailed change tracking
        const updateData: any = {};
        const changeLog: any[] = [];
        
        // Track changes with before/after values
        if (body.name && body.name !== currentMedicine.name) {
            updateData.name = body.name.trim();
            changeLog.push({
                field: 'name',
                before: currentMedicine.name,
                after: body.name.trim(),
                type: 'text'
            });
        }
        
        if (body.quantity !== undefined && body.quantity !== (currentMedicine.stock?.current || currentMedicine.quantity)) {
            updateData.quantity = parseInt(body.quantity);
            changeLog.push({
                field: 'quantity',
                before: currentMedicine.stock?.current || currentMedicine.quantity,
                after: parseInt(body.quantity),
                type: 'number'
            });
        }
        
        if (body.price !== undefined && body.price !== (currentMedicine.pricing?.sellingPrice || currentMedicine.price)) {
            updateData.price = parseFloat(body.price);
            changeLog.push({
                field: 'price',
                before: currentMedicine.pricing?.sellingPrice || currentMedicine.price,
                after: parseFloat(body.price),
                type: 'currency'
            });
        }
        
        if (body.category && body.category !== currentMedicine.category) {
            updateData.category = body.category;
            changeLog.push({
                field: 'category',
                before: currentMedicine.category,
                after: body.category,
                type: 'text'
            });
        }
        
        if (body.expiryDate && body.expiryDate !== (currentMedicine.dates?.expiryDate || currentMedicine.expiryDate)) {
            updateData.expiryDate = body.expiryDate;
            changeLog.push({
                field: 'expiryDate',
                before: currentMedicine.dates?.expiryDate || currentMedicine.expiryDate,
                after: body.expiryDate,
                type: 'date'
            });
        }
        
        // If no changes, return immediate response
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({
                success: true,
                status: 'no_changes',
                medicine: currentMedicine,
                message: '✅ No changes detected - medicine is up to date',
                changed: false,
                changeLog: [],
                timestamp: new Date().toISOString(),
                processingTime: '0ms'
            });
        }
        
        const startTime = Date.now();
        
        console.log('📝 Real-time update processing:', changeLog.length, 'changes');
        
        // Perform immediate update to MongoDB Atlas
        const updatedMedicine = await autoSaveDb.updateMedicine(medicineId, tenant._id, {
            ...currentMedicine,
            ...updateData,
            lastModified: new Date(),
            lastModifiedBy: body.userId || 'system'
        });
        
        const processingTime = Date.now() - startTime;
        
        console.log('✅ Real-time update completed in', processingTime, 'ms');
        
        // Return comprehensive real-time response
        return NextResponse.json({ 
            success: true,
            status: 'updated',
            medicine: updatedMedicine,
            message: `⚡ Medicine updated in real-time (${changeLog.length} changes in ${processingTime}ms)`,
            changed: true,
            changeLog,
            updatedFields: Object.keys(updateData),
            timestamp: new Date().toISOString(),
            processingTime: `${processingTime}ms`,
            tenant: {
                subdomain: tenant.subdomain,
                name: tenant.name
            },
            metadata: {
                totalChanges: changeLog.length,
                updateType: 'realtime',
                source: 'api'
            }
        });
        
    } catch (error) {
        console.error('❌ Real-time update failed:', error);
        return NextResponse.json({ 
            success: false,
            status: 'error',
            error: 'Real-time update failed',
            details: error.message,
            timestamp: new Date().toISOString(),
            metadata: {
                updateType: 'realtime',
                source: 'api'
            }
        }, { status: 500 });
    }
}

// GET endpoint for real-time medicine status
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string; medicineId: string }> }
) {
    try {
        const { subdomain, medicineId } = await params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(medicineId)) {
            return NextResponse.json({ 
                error: 'Invalid medicine ID',
                status: 'error'
            }, { status: 400 });
        }
        
        // Auto-load tenant
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            return NextResponse.json({ 
                error: 'Tenant not found',
                status: 'error'
            }, { status: 404 });
        }
        
        // Get current medicine
        const medicine = await autoSaveDb.getMedicineById(medicineId, tenant._id);
        if (!medicine) {
            return NextResponse.json({ 
                error: 'Medicine not found',
                status: 'error'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            status: 'active',
            medicine,
            timestamp: new Date().toISOString(),
            tenant: {
                subdomain: tenant.subdomain,
                name: tenant.name
            }
        });
        
    } catch (error) {
        console.error('❌ Real-time status check failed:', error);
        return NextResponse.json({ 
            success: false,
            status: 'error',
            error: 'Status check failed',
            details: error.message
        }, { status: 500 });
    }
}