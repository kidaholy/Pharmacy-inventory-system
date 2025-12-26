import { NextRequest, NextResponse } from 'next/server';
import { autoSaveDb } from '../../../../../../lib/services/auto-save-db';
import mongoose from 'mongoose';

// Streaming update endpoint for real-time feedback
export async function POST(
    request: NextRequest, 
    { params }: { params: Promise<{ subdomain: string; medicineId: string }> }
) {
    try {
        const { subdomain, medicineId } = await params;
        const body = await request.json();
        
        // Create a readable stream for real-time updates
        const encoder = new TextEncoder();
        
        const stream = new ReadableStream({
            start(controller) {
                // Send initial status
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'status',
                    message: '🚀 Starting real-time medicine update...',
                    timestamp: new Date().toISOString(),
                    step: 1,
                    totalSteps: 5
                })}\n\n`));
                
                // Process the update with streaming feedback
                processStreamingUpdate(controller, encoder, subdomain, medicineId, body);
            }
        });
        
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
        
    } catch (error) {
        console.error('❌ Streaming update failed:', error);
        return NextResponse.json({ 
            error: 'Streaming update failed',
            details: error.message
        }, { status: 500 });
    }
}

async function processStreamingUpdate(
    controller: ReadableStreamDefaultController,
    encoder: TextEncoder,
    subdomain: string,
    medicineId: string,
    body: any
) {
    try {
        // Step 1: Validate medicine ID
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            message: '🔍 Validating medicine ID...',
            step: 2,
            totalSteps: 5
        })}\n\n`));
        
        if (!mongoose.Types.ObjectId.isValid(medicineId)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'error',
                message: '❌ Invalid medicine ID',
                error: 'Invalid medicine ID'
            })}\n\n`));
            controller.close();
            return;
        }
        
        // Step 2: Load tenant
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            message: '🏢 Loading tenant from MongoDB Atlas...',
            step: 3,
            totalSteps: 5
        })}\n\n`));
        
        const tenant = await autoSaveDb.getTenantBySubdomain(subdomain);
        if (!tenant) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'error',
                message: '❌ Tenant not found',
                error: 'Tenant not found'
            })}\n\n`));
            controller.close();
            return;
        }
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'info',
            message: `✅ Tenant loaded: ${tenant.name}`,
            tenant: { name: tenant.name, subdomain: tenant.subdomain }
        })}\n\n`));
        
        // Step 3: Get current medicine
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            message: '💊 Fetching current medicine data...',
            step: 4,
            totalSteps: 5
        })}\n\n`));
        
        const currentMedicine = await autoSaveDb.getMedicineById(medicineId, tenant._id);
        if (!currentMedicine) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'error',
                message: '❌ Medicine not found',
                error: 'Medicine not found'
            })}\n\n`));
            controller.close();
            return;
        }
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'info',
            message: `✅ Medicine loaded: ${currentMedicine.name}`,
            medicine: { name: currentMedicine.name, id: currentMedicine._id }
        })}\n\n`));
        
        // Step 4: Analyze changes
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            message: '🔄 Analyzing changes...',
            step: 5,
            totalSteps: 5
        })}\n\n`));
        
        const updateData: any = {};
        const changeLog: any[] = [];
        
        // Detailed change analysis with streaming feedback
        if (body.name && body.name !== currentMedicine.name) {
            updateData.name = body.name.trim();
            changeLog.push({ field: 'name', before: currentMedicine.name, after: body.name.trim() });
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'change',
                message: `📝 Name change detected: "${currentMedicine.name}" → "${body.name.trim()}"`,
                field: 'name'
            })}\n\n`));
        }
        
        if (body.quantity !== undefined && body.quantity !== (currentMedicine.stock?.current || currentMedicine.quantity)) {
            const oldQty = currentMedicine.stock?.current || currentMedicine.quantity;
            updateData.quantity = parseInt(body.quantity);
            changeLog.push({ field: 'quantity', before: oldQty, after: parseInt(body.quantity) });
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'change',
                message: `📦 Quantity change detected: ${oldQty} → ${body.quantity}`,
                field: 'quantity'
            })}\n\n`));
        }
        
        if (body.price !== undefined && body.price !== (currentMedicine.pricing?.sellingPrice || currentMedicine.price)) {
            const oldPrice = currentMedicine.pricing?.sellingPrice || currentMedicine.price;
            updateData.price = parseFloat(body.price);
            changeLog.push({ field: 'price', before: oldPrice, after: parseFloat(body.price) });
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'change',
                message: `💰 Price change detected: $${oldPrice} → $${body.price}`,
                field: 'price'
            })}\n\n`));
        }
        
        if (body.category && body.category !== currentMedicine.category) {
            updateData.category = body.category;
            changeLog.push({ field: 'category', before: currentMedicine.category, after: body.category });
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'change',
                message: `🏷️ Category change detected: "${currentMedicine.category}" → "${body.category}"`,
                field: 'category'
            })}\n\n`));
        }
        
        // Check if no changes
        if (Object.keys(updateData).length === 0) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'complete',
                message: '✅ No changes detected - medicine is up to date',
                changed: false,
                medicine: currentMedicine
            })}\n\n`));
            controller.close();
            return;
        }
        
        // Step 5: Apply updates
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            message: `💾 Applying ${changeLog.length} changes to MongoDB Atlas...`,
            changes: changeLog.length
        })}\n\n`));
        
        const startTime = Date.now();
        
        const updatedMedicine = await autoSaveDb.updateMedicine(medicineId, tenant._id, {
            ...currentMedicine,
            ...updateData,
            lastModified: new Date(),
            lastModifiedBy: body.userId || 'system'
        });
        
        const processingTime = Date.now() - startTime;
        
        // Send completion
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            message: `⚡ Medicine updated successfully in ${processingTime}ms!`,
            success: true,
            medicine: updatedMedicine,
            changeLog,
            processingTime: `${processingTime}ms`,
            timestamp: new Date().toISOString()
        })}\n\n`));
        
        controller.close();
        
    } catch (error) {
        console.error('❌ Streaming update error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            message: '❌ Update failed: ' + error.message,
            error: error.message
        })}\n\n`));
        controller.close();
    }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}