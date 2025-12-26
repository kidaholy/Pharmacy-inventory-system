import { broadcastToTenant } from '@/app/api/tenant/[subdomain]/medicines/live-monitor/route';

// Medicine event types for real-time monitoring
export type MedicineEventType = 'medicine_updated' | 'medicine_deleted' | 'medicine_created' | 'stock_alert' | 'expiry_alert';

export interface MedicineRealtimeEvent {
  type: MedicineEventType;
  data: any;
  timestamp: string;
  tenantId: string;
}

// Trigger real-time medicine events
export class MedicineRealtimeNotifier {
  
  static async notifyMedicineCreated(tenantId: string, medicine: any) {
    const event: MedicineRealtimeEvent = {
      type: 'medicine_created',
      data: {
        medicine: {
          id: medicine._id,
          name: medicine.name,
          category: medicine.category,
          currentStock: medicine.currentStock,
          price: medicine.price
        },
        message: `✅ New medicine "${medicine.name}" added to inventory`
      },
      timestamp: new Date().toISOString(),
      tenantId
    };
    
    await broadcastToTenant(tenantId, event);
  }
  
  static async notifyMedicineUpdated(tenantId: string, medicineId: string, updatedFields: any, previousData?: any) {
    const event: MedicineRealtimeEvent = {
      type: 'medicine_updated',
      data: {
        medicineId,
        updatedFields,
        previousData,
        message: `🔄 Medicine updated in real-time`,
        changedFields: Object.keys(updatedFields)
      },
      timestamp: new Date().toISOString(),
      tenantId
    };
    
    await broadcastToTenant(tenantId, event);
  }
  
  static async notifyMedicineDeleted(tenantId: string, medicine: any) {
    const event: MedicineRealtimeEvent = {
      type: 'medicine_deleted',
      data: {
        deletedMedicine: {
          id: medicine._id,
          name: medicine.name,
          category: medicine.category
        },
        message: `🗑️ Medicine "${medicine.name}" removed from inventory`
      },
      timestamp: new Date().toISOString(),
      tenantId
    };
    
    await broadcastToTenant(tenantId, event);
  }
  
  static async notifyStockAlert(tenantId: string, medicines: any[]) {
    const event: MedicineRealtimeEvent = {
      type: 'stock_alert',
      data: {
        count: medicines.length,
        medicines: medicines.map(med => ({
          id: med._id,
          name: med.name,
          currentStock: med.currentStock,
          minStockLevel: med.minStockLevel,
          urgency: med.currentStock === 0 ? 'critical' : 'warning'
        })),
        message: `⚠️ ${medicines.length} medicine(s) have low stock levels`
      },
      timestamp: new Date().toISOString(),
      tenantId
    };
    
    await broadcastToTenant(tenantId, event);
  }
  
  static async notifyExpiryAlert(tenantId: string, medicines: any[]) {
    const event: MedicineRealtimeEvent = {
      type: 'expiry_alert',
      data: {
        count: medicines.length,
        medicines: medicines.map(med => {
          const daysUntilExpiry = Math.ceil((new Date(med.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return {
            id: med._id,
            name: med.name,
            expiryDate: med.expiryDate,
            daysUntilExpiry,
            urgency: daysUntilExpiry <= 7 ? 'critical' : daysUntilExpiry <= 30 ? 'warning' : 'info'
          };
        }),
        message: `📅 ${medicines.length} medicine(s) expiring soon`
      },
      timestamp: new Date().toISOString(),
      tenantId
    };
    
    await broadcastToTenant(tenantId, event);
  }
  
  // Batch notification for multiple events
  static async notifyBatchUpdate(tenantId: string, operations: Array<{
    type: MedicineEventType;
    data: any;
  }>) {
    for (const operation of operations) {
      const event: MedicineRealtimeEvent = {
        type: operation.type,
        data: operation.data,
        timestamp: new Date().toISOString(),
        tenantId
      };
      
      await broadcastToTenant(tenantId, event);
    }
  }
}

// Helper function to check and trigger automatic alerts
export async function checkAndTriggerAlerts(tenantId: string, db: any) {
  try {
    // Check for low stock
    const lowStockMedicines = await db.collection('medicines')
      .find({ 
        tenantId,
        $expr: { $lte: ['$currentStock', '$minStockLevel'] }
      })
      .toArray();
    
    if (lowStockMedicines.length > 0) {
      await MedicineRealtimeNotifier.notifyStockAlert(tenantId, lowStockMedicines);
    }
    
    // Check for expiring medicines (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringMedicines = await db.collection('medicines')
      .find({
        tenantId,
        expiryDate: { $lte: thirtyDaysFromNow }
      })
      .toArray();
    
    if (expiringMedicines.length > 0) {
      await MedicineRealtimeNotifier.notifyExpiryAlert(tenantId, expiringMedicines);
    }
    
  } catch (error) {
    console.error('Error checking alerts:', error);
  }
}