# 🚀 Real-time Medicine Monitoring System

A comprehensive WebSocket-like real-time monitoring system for medicine inventory management using Server-Sent Events (SSE).

## 🎯 Features

### ⚡ Real-time Events
- **Medicine Creation**: Instant notifications when new medicines are added
- **Medicine Updates**: Live sync of medicine changes with field-level tracking
- **Medicine Deletion**: Immediate removal notifications across all clients
- **Stock Alerts**: Automatic low stock warnings with urgency levels
- **Expiry Alerts**: Real-time notifications for medicines expiring within 30 days
- **Heartbeat Monitoring**: Connection health with automatic reconnection

### 🔄 Optimistic Updates
- **Immediate UI Response**: Changes appear instantly before server confirmation
- **Rollback Mechanism**: Automatic revert if server operations fail
- **Error Handling**: Graceful degradation with user feedback

### 🌐 Multi-client Sync
- **Cross-tab Updates**: Changes sync across multiple browser tabs
- **Multi-user Support**: Real-time updates for all connected users
- **Connection Management**: Automatic reconnection with exponential backoff

## 📁 File Structure

```
├── app/api/tenant/[subdomain]/medicines/live-monitor/route.ts  # SSE endpoint
├── lib/realtime-medicine-events.ts                           # Event notification system
├── hooks/useMedicineRealtimeMonitor.ts                       # React hook for SSE
├── components/MedicineRealtimeMonitor.tsx                    # Monitor dashboard
├── components/MedicineRealtimeWrapper.tsx                    # Integration wrapper
└── app/test-realtime-medicine-monitor/page.tsx               # Test page
```

## 🛠️ Implementation

### 1. SSE Endpoint (`live-monitor/route.ts`)

**Features:**
- Server-Sent Events stream for real-time communication
- Connection management with unique IDs
- Periodic heartbeat and alert checking
- Automatic cleanup on disconnect

**Usage:**
```typescript
GET /api/tenant/{subdomain}/medicines/live-monitor
```

**Events:**
- `connection_established`: Initial connection
- `heartbeat`: Periodic health check
- `medicine_created`: New medicine added
- `medicine_updated`: Medicine modified
- `medicine_deleted`: Medicine removed
- `stock_alert`: Low stock warning
- `expiry_alert`: Expiry warning

### 2. Event Notification System (`realtime-medicine-events.ts`)

**Classes:**
- `MedicineRealtimeNotifier`: Static methods for triggering events
- Helper functions for automatic alert checking

**Methods:**
```typescript
// Notify medicine creation
await MedicineRealtimeNotifier.notifyMedicineCreated(tenantId, medicine);

// Notify medicine update
await MedicineRealtimeNotifier.notifyMedicineUpdated(tenantId, medicineId, updatedFields);

// Notify medicine deletion
await MedicineRealtimeNotifier.notifyMedicineDeleted(tenantId, medicine);

// Notify stock alerts
await MedicineRealtimeNotifier.notifyStockAlert(tenantId, medicines);

// Notify expiry alerts
await MedicineRealtimeNotifier.notifyExpiryAlert(tenantId, medicines);
```

### 3. React Hook (`useMedicineRealtimeMonitor.ts`)

**Features:**
- Automatic SSE connection management
- Event history tracking (last 50 events)
- Alert state management
- Reconnection with exponential backoff

**Usage:**
```typescript
const {
  isConnected,
  events,
  stockAlerts,
  expiryAlerts,
  hasStockAlerts,
  hasExpiryAlerts,
  clearStockAlerts,
  clearExpiryAlerts
} = useMedicineRealtimeMonitor(subdomain);
```

### 4. Monitor Dashboard (`MedicineRealtimeMonitor.tsx`)

**Features:**
- Connection status display
- Real-time event log
- Alert management
- Event filtering and clearing

**Usage:**
```tsx
<MedicineRealtimeMonitor 
  subdomain="testpharmacy"
  className="w-full"
/>
```

### 5. Integration Wrapper (`MedicineRealtimeWrapper.tsx`)

**Features:**
- Easy integration with existing components
- Event callbacks for custom handling
- Visual connection status
- Alert notifications

**Usage:**
```tsx
<MedicineRealtimeWrapper
  subdomain="testpharmacy"
  onMedicineCreated={(medicine) => console.log('New medicine:', medicine)}
  onMedicineUpdated={(id, fields) => console.log('Updated:', id, fields)}
  onMedicineDeleted={(medicine) => console.log('Deleted:', medicine)}
  onStockAlert={(medicines) => console.log('Low stock:', medicines)}
  onExpiryAlert={(medicines) => console.log('Expiring:', medicines)}
>
  <YourExistingMedicineComponent />
</MedicineRealtimeWrapper>
```

## 🚀 Quick Start

### 1. Test the System

Visit the test page:
```
/test-realtime-medicine-monitor
```

### 2. Integrate with Existing Components

Wrap your medicine management components:

```tsx
import MedicineRealtimeWrapper from '@/components/MedicineRealtimeWrapper';

export default function YourMedicinePage() {
  return (
    <MedicineRealtimeWrapper
      subdomain="your-subdomain"
      onMedicineCreated={(medicine) => {
        // Handle new medicine
        refreshMedicineList();
      }}
      onMedicineUpdated={(id, fields) => {
        // Handle medicine update
        updateMedicineInList(id, fields);
      }}
    >
      <YourMedicineInventoryComponent />
    </MedicineRealtimeWrapper>
  );
}
```

### 3. Add to Existing API Endpoints

Update your medicine API endpoints to trigger real-time events:

```typescript
import { MedicineRealtimeNotifier } from '@/lib/realtime-medicine-events';

// In your POST /medicines endpoint
const medicine = await createMedicine(data);
await MedicineRealtimeNotifier.notifyMedicineCreated(tenantId, medicine);

// In your PUT /medicines/[id] endpoint
const updatedMedicine = await updateMedicine(id, data);
await MedicineRealtimeNotifier.notifyMedicineUpdated(tenantId, id, updatedFields);

// In your DELETE /medicines/[id] endpoint
await deleteMedicine(id);
await MedicineRealtimeNotifier.notifyMedicineDeleted(tenantId, medicine);
```

## 🎛️ Configuration

### Environment Variables
No additional environment variables required - uses existing MongoDB connection.

### Customization

**Event Types:**
Modify `MedicineEventType` in `realtime-medicine-events.ts` to add custom events.

**Alert Thresholds:**
Adjust alert checking intervals and thresholds in `live-monitor/route.ts`:

```typescript
// Check every 10 seconds (default)
const heartbeatInterval = setInterval(async () => {
  // Custom alert logic
}, 10000);

// Expiry alert threshold (30 days default)
const thirtyDaysFromNow = new Date();
thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
```

**Connection Settings:**
Modify reconnection behavior in `useMedicineRealtimeMonitor.ts`:

```typescript
const maxReconnectAttempts = 5; // Maximum reconnection attempts
const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff
```

## 🧪 Testing

### Manual Testing
1. Open `/test-realtime-medicine-monitor`
2. Create, update, or delete medicines
3. Watch real-time events in the monitor
4. Open multiple tabs to test multi-client sync

### Automated Testing
```typescript
// Test real-time notifications
const response = await fetch('/api/tenant/testpharmacy/medicines', {
  method: 'POST',
  body: JSON.stringify(medicineData)
});

// Verify SSE connection
const eventSource = new EventSource('/api/tenant/testpharmacy/medicines/live-monitor');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  expect(data.type).toBe('medicine_created');
};
```

## 🔧 Troubleshooting

### Connection Issues
- Check browser console for SSE errors
- Verify tenant subdomain exists
- Ensure MongoDB connection is active

### Missing Events
- Check API endpoint integration
- Verify `MedicineRealtimeNotifier` calls
- Check server logs for notification errors

### Performance
- Monitor active connections in heartbeat events
- Adjust heartbeat interval if needed
- Consider connection limits for high-traffic scenarios

## 🚀 Advanced Features

### Custom Event Types
Add new event types by extending the system:

```typescript
// Add to MedicineEventType
type MedicineEventType = 'medicine_updated' | 'custom_event';

// Add notification method
static async notifyCustomEvent(tenantId: string, data: any) {
  const event = {
    type: 'custom_event',
    data,
    timestamp: new Date().toISOString(),
    tenantId
  };
  await broadcastToTenant(tenantId, event);
}
```

### Batch Operations
Handle multiple operations efficiently:

```typescript
await MedicineRealtimeNotifier.notifyBatchUpdate(tenantId, [
  { type: 'medicine_created', data: medicine1 },
  { type: 'medicine_updated', data: { medicineId: 'id', updatedFields: {} } }
]);
```

### Integration with Other Systems
Extend for other inventory items:

```typescript
// Create similar systems for other entities
import { ProductRealtimeNotifier } from '@/lib/realtime-product-events';
import { OrderRealtimeNotifier } from '@/lib/realtime-order-events';
```

## 📊 Monitoring & Analytics

The system provides built-in monitoring:
- Connection count tracking
- Event frequency analysis
- Alert pattern recognition
- Performance metrics via heartbeat

Access monitoring data through the dashboard or programmatically via the hook.

---

## 🎉 Summary

This real-time medicine monitoring system provides:

✅ **Instant Updates**: See changes immediately across all connected clients  
✅ **Smart Alerts**: Automatic stock and expiry notifications  
✅ **Easy Integration**: Drop-in components for existing systems  
✅ **Robust Connection**: Auto-reconnection and error handling  
✅ **Scalable Architecture**: Supports multiple tenants and users  
✅ **Developer Friendly**: Comprehensive hooks and utilities  

Perfect for modern pharmacy management systems requiring real-time inventory tracking! 🚀