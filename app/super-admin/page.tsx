'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/auth';
import { User, Pharmacy, db } from '../../lib/database-safe';
import Link from 'next/link';

export default function SuperAdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const currentUser = auth.requireAuth();
    if (!currentUser) {
      return;
    }

    // Check if user is super admin
    if (currentUser.role !== 'super_admin') {
      window.location.href = '/dashboard';
      return;
    }

    setUser(currentUser);
    loadData();
    setLoading(false);
  }, []);

  const loadData = async () => {
    setPharmacies(await db.getAllPharmacies());
    setUsers(await db.getAllUsers());
    setStats(await db.getStats());
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      auth.logout();
      window.location.href = '/';
    }
  };

  const togglePharmacyStatus = async (pharmacyId: string) => {
    const pharmacy = pharmacies.find(p => p.id === pharmacyId);
    if (pharmacy) {
      await db.updatePharmacy(pharmacyId, { isActive: !pharmacy.isActive });
      loadData();
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      await db.updateUser(userId, { isActive: !targetUser.isActive });
      loadData();
    }
  };

  const deletePharmacy = async (pharmacyId: string) => {
    if (confirm('Are you sure you want to delete this pharmacy? This action cannot be undone.')) {
      await db.deletePharmacy(pharmacyId);
      loadData();
    }
  };

  const deleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      await db.deleteUser(userId);
      loadData();
    }
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'text-blue-600 bg-blue-100';
      case 'professional': return 'text-green-600 bg-green-100';
      case 'enterprise': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">👑</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Super Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                System Overview
              </button>
              <button
                onClick={() => setActiveTab('pharmacies')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pharmacies'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pharmacy Management
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🏪</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Pharmacies</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPharmacies}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Pharmacies</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activePharmacies}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenue (Est.)</p>
                    <p className="text-2xl font-bold text-gray-900">$24.7K</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.subscriptionBreakdown?.starter || 0}</div>
                  <div className="text-sm text-blue-800">Starter Plan</div>
                  <div className="text-xs text-blue-600">$29/month</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.subscriptionBreakdown?.professional || 0}</div>
                  <div className="text-sm text-green-800">Professional Plan</div>
                  <div className="text-xs text-green-600">$79/month</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.subscriptionBreakdown?.enterprise || 0}</div>
                  <div className="text-sm text-purple-800">Enterprise Plan</div>
                  <div className="text-xs text-purple-600">$199/month</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 mr-3">✅</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New pharmacy registered</p>
                    <p className="text-xs text-gray-600">Wellness Pharmacy joined 3 days ago</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 mr-3">📈</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Subscription upgrade</p>
                    <p className="text-xs text-gray-600">HealthPlus Pharmacy upgraded to Enterprise</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-600 mr-3">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment issue</p>
                    <p className="text-xs text-gray-600">MediQuick Pharmacy payment failed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pharmacies' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Pharmacy Management</h3>
              <button 
                onClick={async () => {
                  const name = prompt('Pharmacy Name:');
                  const email = prompt('Pharmacy Email:');
                  const address = prompt('Pharmacy Address:');
                  const phone = prompt('Pharmacy Phone:');
                  const plan = prompt('Subscription Plan (starter/professional/enterprise):') as 'starter' | 'professional' | 'enterprise';
                  
                  if (name && email && address && phone && plan) {
                    try {
                      // Create owner user first
                      const owner = await db.createUser({
                        username: name.toLowerCase().replace(/\s+/g, '_'),
                        email: email,
                        password: 'password123',
                        role: 'admin',
                        isActive: true
                      });
                      
                      // Create pharmacy
                      await db.createPharmacy({
                        name,
                        ownerId: owner.id,
                        address,
                        phone,
                        email,
                        subscriptionPlan: plan,
                        isActive: true
                      });
                      
                      loadData();
                      alert('Pharmacy created successfully!');
                    } catch (error) {
                      console.error('Error creating pharmacy:', error);
                      alert('Error creating pharmacy. Please try again.');
                    }
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Add Pharmacy
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pharmacy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pharmacies.map((pharmacy) => {
                      const owner = users.find(u => u.id === pharmacy.ownerId);
                      return (
                        <tr key={pharmacy.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{pharmacy.name}</div>
                              <div className="text-sm text-gray-500">{pharmacy.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{owner?.username || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{owner?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionColor(pharmacy.subscriptionPlan)}`}>
                              {pharmacy.subscriptionPlan.charAt(0).toUpperCase() + pharmacy.subscriptionPlan.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pharmacy.isActive)}`}>
                              {pharmacy.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(pharmacy.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => togglePharmacyStatus(pharmacy.id)}
                              className={`${
                                pharmacy.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {pharmacy.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="text-blue-600 hover:text-blue-900">Edit</button>
                            <button
                              onClick={() => deletePharmacy(pharmacy.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <button 
                onClick={async () => {
                  const username = prompt('Username:');
                  const email = prompt('Email:');
                  const password = prompt('Password:') || 'password123';
                  const role = prompt('Role (admin/pharmacist/user):') as 'admin' | 'pharmacist' | 'user';
                  
                  if (username && email && role) {
                    try {
                      await db.createUser({
                        username,
                        email,
                        password,
                        role,
                        isActive: true
                      });
                      
                      loadData();
                      alert('User created successfully!');
                    } catch (error) {
                      console.error('Error creating user:', error);
                      alert('Error creating user. Please try again.');
                    }
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Add User
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((targetUser) => (
                      <tr key={targetUser.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{targetUser.username}</div>
                            <div className="text-sm text-gray-500">{targetUser.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {targetUser.role.charAt(0).toUpperCase() + targetUser.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(targetUser.isActive)}`}>
                            {targetUser.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {targetUser.lastLogin ? new Date(targetUser.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(targetUser.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => toggleUserStatus(targetUser.id)}
                            className={`${
                              targetUser.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {targetUser.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">Edit</button>
                          <button
                            onClick={() => deleteUser(targetUser.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">System Analytics</h3>
            
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h4>
              <div className="space-y-3">
                {[
                  { month: 'Jan 2024', revenue: 18500, pharmacies: 3 },
                  { month: 'Feb 2024', revenue: 22300, pharmacies: 4 },
                  { month: 'Mar 2024', revenue: 19800, pharmacies: 4 },
                  { month: 'Apr 2024', revenue: 21200, pharmacies: 5 },
                  { month: 'May 2024', revenue: 24700, pharmacies: 5 },
                  { month: 'Jun 2024', revenue: 26100, pharmacies: 5 }
                ].map((data, index) => {
                  const maxRevenue = 26100;
                  const percentage = (data.revenue / maxRevenue) * 100;
                  return (
                    <div key={data.month} className="flex items-center">
                      <div className="w-20 text-sm text-gray-600">{data.month}</div>
                      <div className="flex-1 mx-3">
                        <div className="bg-gray-200 rounded-full h-6 relative">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-white text-xs font-medium">${(data.revenue / 1000).toFixed(1)}K</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 text-sm text-gray-600 text-right">{data.pharmacies} pharmacies</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Top Performing Pharmacies</h4>
                <div className="space-y-3">
                  {pharmacies.filter(p => p.isActive).slice(0, 3).map((pharmacy, index) => (
                    <div key={pharmacy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{pharmacy.name}</p>
                          <p className="text-sm text-gray-600">{pharmacy.subscriptionPlan} plan</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${(Math.random() * 5000 + 2000).toFixed(0)}</p>
                        <p className="text-sm text-gray-600">monthly</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">System Health</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Server Uptime</span>
                    <span className="text-sm font-medium text-green-600">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Sessions</span>
                    <span className="text-sm font-medium text-blue-600">127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Database Size</span>
                    <span className="text-sm font-medium text-gray-900">2.4 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">API Calls Today</span>
                    <span className="text-sm font-medium text-purple-600">15,432</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="text-sm font-medium text-green-600">0.02%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}