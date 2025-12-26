'use client';

import React, { useState } from 'react';
import MedicineRealtimeMonitor from '@/components/MedicineRealtimeMonitor';

export default function TestRealtimeMedicineMonitor() {
  const [subdomain, setSubdomain] = useState('testpharmacy');
  const [testMedicine, setTestMedicine] = useState({
    name: 'Test Medicine',
    category: 'Antibiotics',
    price: 25.99,
    quantity: 100,
    expiryDate: '2025-12-31'
  });

  // Test functions to trigger real-time events
  const createTestMedicine = async () => {
    try {
      const response = await fetch(`/api/tenant/${subdomain}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testMedicine,
          name: `${testMedicine.name} ${Date.now()}` // Make unique
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('✅ Medicine created! Check the real-time monitor.');
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Network error: ${(error as Error).message}`);
    }
  };

  const updateTestMedicine = async (medicineId: string) => {
    try {
      const response = await fetch(`/api/tenant/${subdomain}/medicines/${medicineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testMedicine,
          price: Math.random() * 100, // Random price update
          quantity: Math.floor(Math.random() * 200)
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('🔄 Medicine updated! Check the real-time monitor.');
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Network error: ${(error as Error).message}`);
    }
  };

  const deleteTestMedicine = async (medicineId: string) => {
    try {
      const response = await fetch(`/api/tenant/${subdomain}/medicines/${medicineId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        alert('🗑️ Medicine deleted! Check the real-time monitor.');
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Network error: ${(error as Error).message}`);
    }
  };

  const getMedicines = async () => {
    try {
      const response = await fetch(`/api/tenant/${subdomain}/medicines`);
      const result = await response.json();
      
      if (result.success) {
        return result.medicines;
      } else {
        alert(`❌ Error: ${result.error}`);
        return [];
      }
    } catch (error) {
      alert(`❌ Network error: ${(error as Error).message}`);
      return [];
    }
  };

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMedicines = async () => {
    setLoading(true);
    const medicineList = await getMedicines();
    setMedicines(medicineList);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Real-time Medicine Monitor Test
          </h1>
          <p className="text-gray-600">
            Test the WebSocket-like real-time medicine monitoring system with live updates, 
            stock alerts, and expiry notifications.
          </p>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant Subdomain
              </label>
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="testpharmacy"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Medicine Name
              </label>
              <input
                type="text"
                value={testMedicine.name}
                onChange={(e) => setTestMedicine(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Test Medicine"
              />
            </div>
          </div>
        </div>

        {/* Real-time Monitor */}
        <MedicineRealtimeMonitor 
          subdomain={subdomain}
          className="col-span-full"
        />

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={createTestMedicine}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              ✅ Create Test Medicine
            </button>
            
            <button
              onClick={loadMedicines}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? '⏳ Loading...' : '📋 Load Medicines'}
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              🔄 Refresh Page
            </button>
          </div>

          {/* Medicine List for Testing */}
          {medicines.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Available Medicines for Testing</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {medicines.map((medicine: any) => (
                  <div key={medicine._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium">{medicine.name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({medicine.category} - ${medicine.price} - {medicine.quantity} units)
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateTestMedicine(medicine._id)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        🔄 Update
                      </button>
                      <button
                        onClick={() => deleteTestMedicine(medicine._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            📋 How to Test Real-time Monitoring
          </h2>
          
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="font-bold">1.</span>
              <span>Watch the <strong>Real-time Monitor</strong> above - it shows connection status and live events</span>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold">2.</span>
              <span>Click <strong>"Create Test Medicine"</strong> to see real-time creation events</span>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold">3.</span>
              <span>Load existing medicines and use <strong>"Update"</strong> or <strong>"Delete"</strong> buttons</span>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold">4.</span>
              <span>Open multiple browser tabs to see <strong>multi-client real-time sync</strong></span>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold">5.</span>
              <span>Check the <strong>Event Log</strong> to see all real-time activities</span>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold">6.</span>
              <span>Monitor <strong>Stock Alerts</strong> and <strong>Expiry Alerts</strong> in real-time</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">🎯 Real-time Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">✅ Medicine Creation</h3>
              <p className="text-sm text-green-700">
                Instant notifications when new medicines are added to inventory
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">🔄 Medicine Updates</h3>
              <p className="text-sm text-blue-700">
                Real-time sync of medicine changes with field-level tracking
              </p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">🗑️ Medicine Deletion</h3>
              <p className="text-sm text-red-700">
                Immediate removal notifications across all connected clients
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Stock Alerts</h3>
              <p className="text-sm text-yellow-700">
                Automatic low stock warnings with urgency levels
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-2">📅 Expiry Alerts</h3>
              <p className="text-sm text-orange-700">
                Real-time notifications for medicines expiring within 30 days
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">💓 Heartbeat</h3>
              <p className="text-sm text-purple-700">
                Connection health monitoring with automatic reconnection
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}