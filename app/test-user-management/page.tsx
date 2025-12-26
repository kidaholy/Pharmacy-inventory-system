'use client';

import React, { useState } from 'react';
import AutoSaveUserManager from '../../components/AutoSaveUserManager';

export default function TestUserManagementPage() {
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
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        👥 User Management Auto-Save System
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Manage users with automatic MongoDB Atlas saving and comprehensive CRUD operations
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
                        Select Tenant to Test User Management
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
                        🧪 How to Test User Management Auto-Save System
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div>
                            <h4 className="font-semibold mb-2">👤 User Operations</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Create users with comprehensive profiles</li>
                                <li>Auto-save to MongoDB Atlas instantly</li>
                                <li>Edit user details with real-time updates</li>
                                <li>Soft delete (deactivate) or hard delete users</li>
                                <li>Filter by role, email status, and search</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">🔧 Advanced Features</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Role-based access control (admin, manager, etc.)</li>
                                <li>Email verification status tracking</li>
                                <li>Notification preferences management</li>
                                <li>Profile information with contact details</li>
                                <li>Multi-language and timezone support</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">🛡️ Security Features</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Password management (hidden in responses)</li>
                                <li>Duplicate username/email prevention</li>
                                <li>Email format validation</li>
                                <li>Tenant isolation for multi-tenancy</li>
                                <li>Soft delete for data recovery</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">📊 Data Management</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Comprehensive user profiles</li>
                                <li>Preference and settings management</li>
                                <li>Real-time search and filtering</li>
                                <li>Automatic timestamp tracking</li>
                                <li>Structured data with validation</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* User Management Component */}
                <AutoSaveUserManager subdomain={selectedTenant} />

                {/* API Endpoints Documentation */}
                <div className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        📚 Available API Endpoints
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-semibold mb-2 text-green-700">GET Endpoints</h4>
                            <ul className="space-y-1 text-gray-600">
                                <li><code>GET /api/tenant/{subdomain}/users</code> - List all users</li>
                                <li><code>GET /api/tenant/{subdomain}/users/{userId}</code> - Get user by ID</li>
                                <li><code>GET /api/debug/auto-save-health</code> - Health check</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 text-blue-700">POST/PUT/DELETE Endpoints</h4>
                            <ul className="space-y-1 text-gray-600">
                                <li><code>POST /api/tenant/{subdomain}/users</code> - Create user</li>
                                <li><code>PUT /api/tenant/{subdomain}/users/{userId}</code> - Update user</li>
                                <li><code>DELETE /api/tenant/{subdomain}/users/{userId}</code> - Soft delete</li>
                                <li><code>DELETE /api/tenant/{subdomain}/users/{userId}?permanent=true</code> - Hard delete</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-500">
                    <p>
                        🔄 All operations automatically save to MongoDB Atlas • 
                        🏢 Multi-tenant isolated • 
                        🛡️ Security and validation included • 
                        📊 Real-time status tracking • 
                        👥 Complete user lifecycle management
                    </p>
                </div>
            </div>
        </div>
    );
}