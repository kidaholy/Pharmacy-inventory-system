import { NextRequest, NextResponse } from 'next/server';
import { autoSaveDb } from '../../../../../../lib/services/auto-save-db';
import mongoose from 'mongoose';

// Batch update endpoint for multiple medicines with real-time feedback
export async function POST(
    request: NextRequest, 
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const { subdomain } = await params;
        const body = await request.json();
        const { updates, userId } = body; // Array of { medicineId, data }
        
        console.log('🚀 Batch update initiated for', updates?.length || 0, 'medicines');
        
        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return NextResponse.json({ 
                error: 'No updates provided',
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
        
        const results = [];
        const startTime = Date.now();
        let successCount = 0;
        let errorCount = 0;
        
        // Process each update
        for (let i = 0; i < updates.length; i++) {
            const update = updates[i];
            const { medicineId, data } = update;
            
            try {
                // Validate ObjectId
                if (!mongoose.Types.ObjectId.isValid(medicineId)) {
                    results.push({
                        medicineId,
                        success: false,
                        error: 'Invalid medicine ID',
                        index: i
                    });
                    errorCount++;
                    continue;
                }
                
                // Get current medicine
                const currentMedicine = await autoSaveDb.getMedicineById(medicineId, tenant._id);
                if (!currentMedicine) {
                    results.push({
                        medicineId,
                        success: false,
                        error: 'Medicine not found',
                        index: i
                    });
                    errorCount++;
                    continue;
                }
                
                // Prepare update data
                const updateData: any = {};
                const changeLog: any[] = [];
                
                if (data.name && data.name !== currentMedicine.name) {
                    updateData.name = data.name.trim();
                    changeLog.push({ field: 'name', before: currentMedicine.name, after: data.name.trim() });
                }
                
                if (data.quantity !== undefined && data.quantity !== (currentMedicine.stock?.current || currentMedicine.quantity)) {
                    updateData.quantity = parseInt(data.quantity);
                    changeLog.push({ 
                        field: 'quantity', 
                        before: currentMedicine.stock?.current || currentMedicine.quantity, 
                        after: parseInt(data.quantity) 
                    });
                }
                
                if (data.price !== undefined && data.price !== (currentMedicine.pricing?.sellingPrice || currentMedicine.price)) {
                    updateData.price = parseFloat(data.price);
                    changeLog.push({ 
                        field: 'price', 
                        before: currentMedicine.pricing?.sellingPrice || currentMedicine.price, 
                        after: parseFloat(data.price) 
                    });
                }
                
                if (data.category && data.category !== currentMedicine.category) {
                    updateData.category = data.category;
                    changeLog.push({ field: 'category', before: currentMedicine.category, after: data.category });
                }
                
                // Apply update if there are changes
                if (Object.keys(updateData).length > 0) {
                    const updatedMedicine = await autoSaveDb.updateMedicine(medicineId, tenant._id, {
                        ...currentMedicine,
                        ...updateData,
                        lastModified: new Date(),
                        lastModifiedBy: userId || 'system'
                    });
                    
                    results.push({
                        medicineId,
                        success: true,
                        medicine: updatedMedicine,
                        changeLog,
                        changesCount: changeLog.length,
                        index: i
                    });
                    successCount++;
                } else {
                    results.push({
                        medicineId,
                        success: true,
                        medicine: currentMedicine,
                        changeLog: [],
                        changesCount: 0,
                        message: 'No changes detected',
                        index: i
                    });
                    successCount++;
                }
                
            } catch (error) {
                console.error(`❌ Batch update failed for medicine ${medicineId}:`, error);
                results.push({
                    medicineId,
                    success: false,
                    error: error.message,
                    index: i
                });
                errorCount++;
            }
        }
        
        const processingTime = Date.now() - startTime;
        
        console.log(`✅ Batch update completed: ${successCount} success, ${errorCount} errors in ${processingTime}ms`);
        
        return NextResponse.json({
            success: errorCount === 0,
            status: errorCount === 0 ? 'completed' : 'partial',
            message: `⚡ Batch update completed: ${successCount} success, ${errorCount} errors in ${processingTime}ms`,
            results,
            summary: {
                total: updates.length,
                successful: successCount,
                failed: errorCount,
                processingTime: `${processingTime}ms`
            },
            timestamp: new Date().toISOString(),
            tenant: {
                subdomain: tenant.subdomain,
                name: tenant.name
            }
        });
        
    } catch (error) {
        console.error('❌ Batch update failed:', error);
        return NextResponse.json({ 
            success: false,
            status: 'error',
            error: 'Batch update failed',
            details: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// GET endpoint for batch operation status
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const { subdomain } = await params;
        const url = new URL(request.url);
        const medicineIds = url.searchParams.get('ids')?.split(',') || [];
        
        if (medicineIds.length === 0) {
            return NextResponse.json({ 
                error: 'No medicine IDs provided',
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
        
        const medicines = [];
        
        for (const medicineId of medicineIds) {
            if (mongoose.Types.ObjectId.isValid(medicineId)) {
                const medicine = await autoSaveDb.getMedicineById(medicineId, tenant._id);
                if (medicine) {
                    medicines.push(medicine);
                }
            }
        }
        
        return NextResponse.json({
            success: true,
            status: 'active',
            medicines,
            count: medicines.length,
            timestamp: new Date().toISOString(),
            tenant: {
                subdomain: tenant.subdomain,
                name: tenant.name
            }
        });
        
    } catch (error) {
        console.error('❌ Batch status check failed:', error);
        return NextResponse.json({ 
            success: false,
            status: 'error',
            error: 'Batch status check failed',
            details: error.message
        }, { status: 500 });
    }
}