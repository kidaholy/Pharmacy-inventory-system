'use client';

import React, { useState } from 'react';
import AutoSaveCategoryForm from '../../components/AutoSaveCategoryForm';
import AutoSaveMedicineForm from '../../components/AutoSaveMedicineForm';

export default function TestMedicineAutoSavePage() {
    const [selectedTenant, setSelectedTenant] = useState('tadepharma');
    const [activeTab, setActiveTab] = useState<'categories' | 'medicines'>('medicines');
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
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        🏥 Complete Pharmacy Auto-Save System
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Manage Categories & Medicines with automatic MongoDB Atlas saving
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

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="flex justify-center">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('medicines')}
                                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                                    activeTab === 'medicines'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                💊 Medicines
                            </button>
                            <button
                                onClick={() => setActiveTab('categories')}
                                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                                    activeTab === 'categories'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                📂 Categories
                            </button>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                        🧪 How to Test Complete Auto-Save System
                    </h3>
                    
                    {activeTab === 'medicines' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                            <div>
                                <h4 className="font-semibold mb-2">💊 Medicine Operations</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Create medicines with detailed information</li>
                                    <li>Auto-save to MongoDB Atlas instantly</li>
                                    <li>Filter by category, stock level, expiry</li>
                                    <li>Update medicine details with auto-save</li>
                                    <li>Delete medicines with confirmation</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">🔍 Advanced Features</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Stock level monitoring (Low/Medium/Good)</li>
                                    <li>Expiry date tracking (Expired/Expiring/Good)</li>
                                    <li>Prescription requirement flags</li>
                                    <li>Comprehensive medicine information</li>
                                    <li>Real-time search and filtering</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                            <div>
                                <h4 className="font-semibold mb-2">📂 Category Management</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Create categories for medicine organization</li>
                                    <li>Auto-save with color coding and icons</li>
                                    <li>Edit category details instantly</li>
                                    <li>Delete categories with safety checks</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">🎨 Customization</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Color picker for visual organization</li>
                                    <li>Icon support for easy identification</li>
                                    <li>Description fields for detailed info</li>
                                    <li>Tenant-isolated category management</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                {activeTab === 'medicines' ? (
                    <AutoSaveMedicineForm subdomain={selectedTenant} />
                ) : (
                    <AutoSaveCategoryForm subdomain={selectedTenant} />
                )}

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-500">
                    <p>
                        🔄 All operations automatically save to MongoDB Atlas • 
                        🏢 Multi-tenant isolated • 
                        🛡️ Comprehensive validation • 
                        📊 Real-time status tracking • 
                        💊 Complete pharmacy management
                    </p>
                </div>
            </div>
        </div>
    );
}