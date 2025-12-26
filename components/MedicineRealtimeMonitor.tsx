'use client';

import React, { useState } from 'react';
import { useMedicineRealtimeMonitor } from '@/hooks/useMedicineRealtimeMonitor';

interface MedicineRealtimeMonitorProps {
  subdomain: string;
  className?: string;
}

export default function MedicineRealtimeMonitor({ 
  subdomain, 
  className = '' 
}: MedicineRealtimeMonitorProps) {
  const {
    isConnected,
    connectionId,
    lastHeartbeat,
    events,
    stockAlerts,
    expiryAlerts,
    medicineCount,
    activeConnections,
    reconnectAttempts,
    clearStockAlerts,
    clearExpiryAlerts,
    clearAllEvents,
    getRecentEvents,
    hasStockAlerts,
    hasExpiryAlerts,
    criticalStockAlerts,
    criticalExpiryAlerts,
    totalAlerts
  } = useMedicineRealtimeMonitor(subdomain);

  const [showEventLog, setShowEventLog] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'medicine_created': return '✅';
      case 'medicine_updated': return '🔄';
      case 'medicine_deleted': return '🗑️';
      case 'stock_alert': return '⚠️';
      case 'expiry_alert': return '📅';
      case 'connection_established': return '🔗';
      case 'heartbeat': return '💓';
      default: return '📡';
    }
  };

  const getAlertUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <h3 className="text-lg font-semibold">Real-time Medicine Monitor</h3>
            {reconnectAttempts > 0 && (
              <span className="text-sm text-yellow-600">
                Reconnecting... (attempt {reconnectAttempts})
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Medicines: {medicineCount}</span>
            <span>Connections: {activeConnections}</span>
            {lastHeartbeat && (
              <span>Last update: {formatTimestamp(lastHeartbeat)}</span>
            )}
          </div>
        </div>
        
        {connectionId && (
          <p className="text-xs text-gray-500 mt-1">
            Connection ID: {connectionId}
          </p>
        )}
      </div>

      {/* Alert Summary */}
      {totalAlerts > 0 && showAlerts && (
        <div className="p-4 bg-yellow-50 border-b">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-yellow-800">Active Alerts ({totalAlerts})</h4>
            <button
              onClick={() => setShowAlerts(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </button>
          </div>
          
          {/* Stock Alerts */}
          {hasStockAlerts && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-700">
                  ⚠️ Low Stock ({stockAlerts.length})
                </span>
                <button
                  onClick={clearStockAlerts}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {stockAlerts.slice(0, 3).map((alert, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded border ${getAlertUrgencyColor(alert.urgency)}`}
                  >
                    <strong>{alert.name}</strong>: {alert.currentStock} / {alert.minStockLevel} units
                  </div>
                ))}
                {stockAlerts.length > 3 && (
                  <p className="text-xs text-gray-600">
                    +{stockAlerts.length - 3} more medicines with low stock
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Expiry Alerts */}
          {hasExpiryAlerts && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-700">
                  📅 Expiring Soon ({expiryAlerts.length})
                </span>
                <button
                  onClick={clearExpiryAlerts}
                  className="text-xs text-orange-600 hover:text-orange-800"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {expiryAlerts.slice(0, 3).map((alert, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded border ${getAlertUrgencyColor(alert.urgency)}`}
                  >
                    <strong>{alert.name}</strong>: expires in {alert.daysUntilExpiry} days
                  </div>
                ))}
                {expiryAlerts.length > 3 && (
                  <p className="text-xs text-gray-600">
                    +{expiryAlerts.length - 3} more medicines expiring soon
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Log Toggle */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowEventLog(!showEventLog)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span>{showEventLog ? '▼' : '▶'}</span>
            <span>Event Log ({events.length})</span>
          </button>
          
          {showEventLog && events.length > 0 && (
            <button
              onClick={clearAllEvents}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Event Log */}
      {showEventLog && (
        <div className="max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No events yet. Waiting for real-time updates...
            </div>
          ) : (
            <div className="divide-y">
              {getRecentEvents(20).map((event, index) => (
                <div key={index} className="p-3 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getEventIcon(event.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {event.type.replace('_', ' ')}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      
                      {event.data.message && (
                        <p className="text-sm text-gray-600 mt-1">
                          {event.data.message}
                        </p>
                      )}
                      
                      {/* Additional event details */}
                      {event.type === 'medicine_updated' && event.data.changedFields && (
                        <p className="text-xs text-gray-500 mt-1">
                          Updated: {event.data.changedFields.join(', ')}
                        </p>
                      )}
                      
                      {(event.type === 'stock_alert' || event.type === 'expiry_alert') && (
                        <p className="text-xs text-gray-500 mt-1">
                          {event.data.count} medicine(s) affected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Connection Status Footer */}
      <div className="p-3 bg-gray-50 text-xs text-gray-600 border-t">
        <div className="flex items-center justify-between">
          <span>
            Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          <span>
            Tenant: {subdomain}
          </span>
        </div>
      </div>
    </div>
  );
}