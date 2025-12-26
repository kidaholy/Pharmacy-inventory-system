import { useState, useEffect, useCallback, useRef } from 'react';

export interface MedicineRealtimeEvent {
  type: 'medicine_updated' | 'medicine_deleted' | 'medicine_created' | 'stock_alert' | 'expiry_alert' | 'connection_established' | 'heartbeat';
  data: any;
  timestamp: string;
  tenantId: string;
}

export interface MedicineMonitorState {
  isConnected: boolean;
  connectionId: string | null;
  lastHeartbeat: string | null;
  events: MedicineRealtimeEvent[];
  stockAlerts: any[];
  expiryAlerts: any[];
  medicineCount: number;
  activeConnections: number;
}

export function useMedicineRealtimeMonitor(subdomain: string) {
  const [state, setState] = useState<MedicineMonitorState>({
    isConnected: false,
    connectionId: null,
    lastHeartbeat: null,
    events: [],
    stockAlerts: [],
    expiryAlerts: [],
    medicineCount: 0,
    activeConnections: 0
  });
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  // Add event to history (keep last 50 events)
  const addEvent = useCallback((event: MedicineRealtimeEvent) => {
    setState(prev => ({
      ...prev,
      events: [event, ...prev.events].slice(0, 50)
    }));
  }, []);

  // Handle incoming events
  const handleEvent = useCallback((event: MedicineRealtimeEvent) => {
    addEvent(event);
    
    switch (event.type) {
      case 'connection_established':
        setState(prev => ({
          ...prev,
          isConnected: true,
          connectionId: event.data.connectionId
        }));
        setReconnectAttempts(0);
        break;
        
      case 'heartbeat':
        setState(prev => ({
          ...prev,
          lastHeartbeat: event.timestamp,
          medicineCount: event.data.medicineCount || prev.medicineCount,
          activeConnections: event.data.activeConnections || prev.activeConnections
        }));
        break;
        
      case 'stock_alert':
        setState(prev => ({
          ...prev,
          stockAlerts: event.data.medicines || []
        }));
        break;
        
      case 'expiry_alert':
        setState(prev => ({
          ...prev,
          expiryAlerts: event.data.medicines || []
        }));
        break;
        
      case 'medicine_created':
      case 'medicine_updated':
      case 'medicine_deleted':
        // These events are handled by the component consuming this hook
        break;
    }
  }, [addEvent]);

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/tenant/${subdomain}/medicines/live-monitor`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('🔗 Medicine monitor connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data: MedicineRealtimeEvent = JSON.parse(event.data);
        handleEvent(data);
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setState(prev => ({ ...prev, isConnected: false }));
      
      // Attempt reconnection with exponential backoff
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connect();
        }, delay);
      }
    };

    return eventSource;
  }, [subdomain, handleEvent, reconnectAttempts]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      connectionId: null
    }));
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Clear alerts
  const clearStockAlerts = useCallback(() => {
    setState(prev => ({ ...prev, stockAlerts: [] }));
  }, []);

  const clearExpiryAlerts = useCallback(() => {
    setState(prev => ({ ...prev, expiryAlerts: [] }));
  }, []);

  const clearAllEvents = useCallback(() => {
    setState(prev => ({ ...prev, events: [] }));
  }, []);

  // Get events by type
  const getEventsByType = useCallback((type: MedicineRealtimeEvent['type']) => {
    return state.events.filter(event => event.type === type);
  }, [state.events]);

  // Get recent events (last N events)
  const getRecentEvents = useCallback((count: number = 10) => {
    return state.events.slice(0, count);
  }, [state.events]);

  return {
    // Connection state
    isConnected: state.isConnected,
    connectionId: state.connectionId,
    lastHeartbeat: state.lastHeartbeat,
    reconnectAttempts,
    
    // Data
    events: state.events,
    stockAlerts: state.stockAlerts,
    expiryAlerts: state.expiryAlerts,
    medicineCount: state.medicineCount,
    activeConnections: state.activeConnections,
    
    // Actions
    connect,
    disconnect,
    clearStockAlerts,
    clearExpiryAlerts,
    clearAllEvents,
    
    // Helpers
    getEventsByType,
    getRecentEvents,
    
    // Computed values
    hasStockAlerts: state.stockAlerts.length > 0,
    hasExpiryAlerts: state.expiryAlerts.length > 0,
    criticalStockAlerts: state.stockAlerts.filter(alert => alert.urgency === 'critical'),
    criticalExpiryAlerts: state.expiryAlerts.filter(alert => alert.urgency === 'critical'),
    totalAlerts: state.stockAlerts.length + state.expiryAlerts.length
  };
}