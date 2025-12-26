'use client';

import React, { useEffect } from 'react';
import { useMedicineRealtimeMonitor } from '@/hooks/useMedicineRealtimeMonitor';

interface MedicineRealtimeWrapperProps {
  subdomain: string;
  children: React.ReactNode;
  onMedicineCreated?: (medicine: any) => void;
  onMedicineUpdated?: (medicineId: string, updatedFields: any) => void;
  onMedicineDeleted?: (medicine: any) => void;
  onStockAlert?: (medicines: any[]) => void;
  onExpiryAlert?: (medicines: any[]) => void;
}

/**
 * Wrapper component that provides real-time medicine monitoring to child components
 * Use this to wrap your existing medicine management components to add real-time capabilities
 */
export default function MedicineRealtimeWrapper({
  subdomain,
  children,
  onMedicineCreated,
  onMedicineUpdated,
  onMedicineDeleted,
  onStockAlert,
  onExpiryAlert
}: MedicineRealtimeWrapperProps) {
  const {
    isConnected,
    events,
    stockAlerts,
    expiryAlerts,
    hasStockAlerts,
    hasExpiryAlerts,
    getEventsByType
  } = useMedicineRealtimeMonitor(subdomain);

  // Handle real-time events
  useEffect(() => {
    const recentEvents = events.slice(0, 5); // Check last 5 events
    
    for (const event of recentEvents) {
      switch (event.type) {
        case 'medicine_created':
          if (onMedicineCreated && event.data.medicine) {
            onMedicineCreated(event.data.medicine);
          }
          break;
          
        case 'medicine_updated':
          if (onMedicineUpdated && event.data.medicineId && event.data.updatedFields) {
            onMedicineUpdated(event.data.medicineId, event.data.updatedFields);
          }
          break;
          
        case 'medicine_deleted':
          if (onMedicineDeleted && event.data.deletedMedicine) {
            onMedicineDeleted(event.data.deletedMedicine);
          }
          break;
      }
    }
  }, [events, onMedicineCreated, onMedicineUpdated, onMedicineDeleted]);

  // Handle stock alerts
  useEffect(() => {
    if (hasStockAlerts && onStockAlert) {
      onStockAlert(stockAlerts);
    }
  }, [stockAlerts, hasStockAlerts, onStockAlert]);

  // Handle expiry alerts
  useEffect(() => {
    if (hasExpiryAlerts && onExpiryAlert) {
      onExpiryAlert(expiryAlerts);
    }
  }, [expiryAlerts, hasExpiryAlerts, onExpiryAlert]);

  return (
    <div className="relative">
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium shadow-lg ${
          isConnected 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? 'Real-time Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Alert Notifications */}
      {(hasStockAlerts || hasExpiryAlerts) && (
        <div className="fixed top-16 right-4 z-50 space-y-2 max-w-sm">
          {hasStockAlerts && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600">⚠️</span>
                <span className="text-sm font-medium text-yellow-800">
                  {stockAlerts.length} medicine(s) have low stock
                </span>
              </div>
            </div>
          )}
          
          {hasExpiryAlerts && (
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <span className="text-orange-600">📅</span>
                <span className="text-sm font-medium text-orange-800">
                  {expiryAlerts.length} medicine(s) expiring soon
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Child Components */}
      {children}
    </div>
  );
}