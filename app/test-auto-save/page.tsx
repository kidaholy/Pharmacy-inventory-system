'use client';

import React, { useState } from 'react';
import AutoSaveCategoryForm from '../../components/AutoSaveCategoryForm';

export default function TestAutoSavePage() {
    const [selectedTenant, setSelectedTenant] = useState('tadepharma');
    const [healthStatus, setHealthStatus] = useState<any>(null);
    const [checkingHealth, setCheckingHealth] = useState(false);

    const availableTenants = [
        { subdomain: 'tadepharma', name: 'Sosi Pharmacy' },
        { subdomain: 'jossypharma', name: 'Yosef Pharmacy' },
        { subdomain: 'addisababa', name: 'Kalzer Pharmacy' }
    ];

    const checkAutoSaveHealth = async () => {
        try {
            setCheckingHealth(true);
            const response = await fetch('/api/debug/auto-save-health');
            const data = await response.json();
            setHealthStatus(data);
        } catch (error) {
            setHealthStatus({
                success: false,
                message: 'Failed to check auto-save health'
            });
        } finally {
            setCheckingHealth(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        🚀 Auto-Save CRUD System Test
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Test all CRUD operations with automatic MongoDB Atlas saving
                    </p>
                    
                    {/* Health Check */}
                    <div className="mb-6">
                        <button
                            onClick={checkAutoSaveHealth}
                            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                            disabled={checkingHealth}
                        >
                            {checkingHealth ? 'Checking...' : '🔍 Check Auto-Save Health'}
                        </button>
                        
                        {healthStatus && (
                            <div className={`mt-4 p-4 rounded-lg ${
                                healthStatus.success 
                                    ? 'bg-green-50 border border-green-200 text-green-800' 
                                    : 'bg-red-50 border border-red-200 text-red-800'
                            }`}>
                                <div className="font-semibold mb-2">
                                    Auto-Save System Status: {healthStatus.autoSave?.status || 'Unknown'}
                                </div>
                                <div className="text-sm">
                                    {healthStatus.message}
                                </div>
                                {healthStatus.autoSave && (
                                    <div className="text-xs mt-2 opacity-75">
                                        Connection: {healthStatus.autoSave.databaseConnection ? '✅ Connected' : '❌ Disconnected'} • 
                                        Auto-Save: {healthStatus.autoSave.autoSaveEnabled ? '✅ Enabled' : '❌ Disabled'} • 
                                        Time: {new Date(healthStatus.autoSave.timestamp).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tenant Selector */}
                <div className="mb-8 text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Tenant to Test Auto-Save Operations
                    </label>
                    <select
                        value={selectedTenant}
                        onChange={(e) => setSelectedTenant(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {availableTenants.map(tenant => (
                            <option key={tenant.subdomain} value={tenant.subdomain}>
                                {tenant.name} ({tenant.subdomain})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Instructions */}
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                        🧪 How to Test Auto-Save CRUD Operations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div>
                            <h4 className="font-semibold mb-2">✅ CREATE (Auto-Save)</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Click "Add New Category"</li>
                                <li>Fill in the form</li>
                                <li>Click "Auto-Save"</li>
                                <li>Watch it save to MongoDB Atlas</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">📖 READ (Auto-Load)</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Categories auto-load on page load</li>
                                <li>Click "Refresh Categories"</li>
                                <li>Data loads from MongoDB Atlas</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">✏️ UPDATE (Auto-Update)</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Click "Edit" on any category</li>
                                <li>Modify the fields</li>
                                <li>Click "Auto-Update"</li>
                                <li>Changes save to MongoDB Atlas</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">🗑️ DELETE (Auto-Delete)</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Click "Delete" on any category</li>
                                <li>Confirm the deletion</li>
                                <li>Soft delete saves to MongoDB Atlas</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Auto-Save Form */}
                <AutoSaveCategoryForm subdomain={selectedTenant} />

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-500">
                    <p>
                        🔄 All operations automatically save to MongoDB Atlas • 
                        🏢 Multi-tenant isolated • 
                        🛡️ Error handling included • 
                        📊 Real-time logging enabled
                    </p>
                </div>
            </div>
        </div>
    );
}