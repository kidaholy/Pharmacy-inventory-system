import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Store active connections for real-time updates
const activeConnections = new Map<string, WritableStreamDefaultWriter>();

// Medicine change event types
type MedicineEvent = {
  type: 'medicine_updated' | 'medicine_deleted' | 'medicine_created' | 'stock_alert' | 'expiry_alert';
  data: any;
  timestamp: string;
  tenantId: string;
};

// Broadcast to all active connections for a tenant
export async function broadcastToTenant(tenantId: string, event: MedicineEvent) {
  const connections = Array.from(activeConnections.entries())
    .filter(([connectionId]) => connectionId.startsWith(`${tenantId}:`));
  
  const eventData = `data: ${JSON.stringify(event)}\n\n`;
  
  for (const [connectionId, writer] of connections) {
    try {
      await writer.write(new TextEncoder().encode(eventData));
    } catch (error) {
      console.error(`Failed to send to connection ${connectionId}:`, error);
      activeConnections.delete(connectionId);
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  const { subdomain } = params;
  
  try {
    // Verify tenant exists
    const { db } = await connectToDatabase();
    const tenant = await db.collection('tenants').findOne({ subdomain });
    
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        const connectionId = `${tenant._id}:${Date.now()}:${Math.random()}`;
        const writer = controller;
        
        // Store connection
        activeConnections.set(connectionId, writer as any);
        
        // Send initial connection event
        const initialEvent = {
          type: 'connection_established' as const,
          data: { 
            connectionId,
            tenantId: tenant._id.toString(),
            message: '🔗 Real-time medicine monitoring connected'
          },
          timestamp: new Date().toISOString(),
          tenantId: tenant._id.toString()
        };
        
        const eventData = `data: ${JSON.stringify(initialEvent)}\n\n`;
        writer.enqueue(new TextEncoder().encode(eventData));
        
        // Send periodic heartbeat and check for alerts
        const heartbeatInterval = setInterval(async () => {
          try {
            // Check for low stock alerts
            const lowStockMedicines = await db.collection('medicines')
              .find({ 
                tenantId: new ObjectId(tenant._id),
                $expr: { $lte: ['$currentStock', '$minStockLevel'] }
              })
              .toArray();
            
            if (lowStockMedicines.length > 0) {
              const alertEvent: MedicineEvent = {
                type: 'stock_alert',
                data: {
                  count: lowStockMedicines.length,
                  medicines: lowStockMedicines.map(med => ({
                    id: med._id,
                    name: med.name,
                    currentStock: med.currentStock,
                    minStockLevel: med.minStockLevel
                  }))
                },
                timestamp: new Date().toISOString(),
                tenantId: tenant._id.toString()
              };
              
              const alertData = `data: ${JSON.stringify(alertEvent)}\n\n`;
              writer.enqueue(new TextEncoder().encode(alertData));
            }
            
            // Check for expiring medicines (within 30 days)
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            
            const expiringMedicines = await db.collection('medicines')
              .find({
                tenantId: new ObjectId(tenant._id),
                expiryDate: { $lte: thirtyDaysFromNow }
              })
              .toArray();
            
            if (expiringMedicines.length > 0) {
              const expiryEvent: MedicineEvent = {
                type: 'expiry_alert',
                data: {
                  count: expiringMedicines.length,
                  medicines: expiringMedicines.map(med => ({
                    id: med._id,
                    name: med.name,
                    expiryDate: med.expiryDate,
                    daysUntilExpiry: Math.ceil((new Date(med.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  }))
                },
                timestamp: new Date().toISOString(),
                tenantId: tenant._id.toString()
              };
              
              const expiryData = `data: ${JSON.stringify(expiryEvent)}\n\n`;
              writer.enqueue(new TextEncoder().encode(expiryData));
            }
            
            // Send heartbeat
            const heartbeatEvent = {
              type: 'heartbeat' as const,
              data: { 
                timestamp: new Date().toISOString(),
                activeConnections: activeConnections.size,
                medicineCount: await db.collection('medicines').countDocuments({ tenantId: new ObjectId(tenant._id) })
              },
              timestamp: new Date().toISOString(),
              tenantId: tenant._id.toString()
            };
            
            const heartbeatData = `data: ${JSON.stringify(heartbeatEvent)}\n\n`;
            writer.enqueue(new TextEncoder().encode(heartbeatData));
            
          } catch (error) {
            console.error('Heartbeat error:', error);
            clearInterval(heartbeatInterval);
            activeConnections.delete(connectionId);
            writer.close();
          }
        }, 10000); // Every 10 seconds
        
        // Cleanup on connection close
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);
          activeConnections.delete(connectionId);
          writer.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });

  } catch (error) {
    console.error('Live monitor error:', error);
    return NextResponse.json(
      { error: 'Failed to establish live monitoring connection' },
      { status: 500 }
    );
  }
}