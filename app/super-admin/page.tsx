'use client';

import { useState, useEffect } from 'react';
import { auth, User } from '../../lib/auth';
import { formatCurrency } from '../../lib/utils';

interface Tenant {
  _id: string;
  name: string;
  subdomain: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  isActive: boolean;
  createdAt: string;
  contact: {
    email: string;
    phone?: string;
    city?: string;
    country?: string;
  };
}

interface DatabaseUser {
  _id: string;
  tenantId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  security?: {
    lastLogin?: string;
  };
}

export default function SuperAdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<DatabaseUser[]>([]);
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
    try {
      // Load tenants
      const tenantsResponse = await fetch('/api/tenants');
      if (tenantsResponse.ok) {
        const tenantsData = await tenantsResponse.json();
        setTenants(tenantsData.tenants || []);
      }

      // Load all users from all tenants
      const allUsers: DatabaseUser[] = [];
      const tenantsData = await fetch('/api/tenants').then(r => r.json());

      for (const tenant of tenantsData.tenants || []) {
        const usersResponse = await fetch(`/api/users?tenantId=${tenant._id}`);
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          allUsers.push(...(usersData.users || []));
        }
      }

      setUsers(allUsers);

      // Calculate stats
      setStats({
        totalTenants: tenantsData.tenants?.length || 0,
        activeTenants: tenantsData.tenants?.filter((t: Tenant) => t.isActive).length || 0,
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.isActive).length
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      auth.logout();
      window.location.href = '/';
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
              <span className="text-sm text-gray-600">Welcome, {user.firstName}</span>
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                System Overview
              </button>
              <button
                onClick={() => setActiveTab('tenants')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tenants'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Tenant Management
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                User Management
              </button>

            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* No Tenants Warning */}
            {stats.totalTenants === 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-yellow-800">No Pharmacy Tenants Registered</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>The system is ready, but no pharmacy tenants have been created yet.</p>
                      <p className="mt-1">
                        <strong>Next steps:</strong>
                      </p>
                      <ul className="mt-2 list-disc list-inside">
                        <li>Go to the "Tenant Management" tab</li>
                        <li>Click "Create Tenant" to add your first pharmacy</li>
                        <li>Each tenant will automatically get an admin user</li>
                        <li>Regular users can then login to their respective pharmacies</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                    <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTenants || 0}</p>
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
                    <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeTenants || 0}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{tenants.filter(t => t.subscriptionPlan === 'starter').length}</div>
                  <div className="text-sm text-blue-800">Starter Plan</div>
                  <div className="text-xs text-blue-600">{formatCurrency(29)}/month</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{tenants.filter(t => t.subscriptionPlan === 'professional').length}</div>
                  <div className="text-sm text-green-800">Professional Plan</div>
                  <div className="text-xs text-green-600">{formatCurrency(79)}/month</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{tenants.filter(t => t.subscriptionPlan === 'enterprise').length}</div>
                  <div className="text-sm text-purple-800">Enterprise Plan</div>
                  <div className="text-xs text-purple-600">{formatCurrency(199)}/month</div>
                </div>
              </div>
            </div>


          </div>
        )}

        {activeTab === 'tenants' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tenant Management</h3>
                {tenants.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">⚠️ No tenants exist. Regular users cannot login until tenants are created.</p>
                )}
              </div>
              <button
                onClick={async () => {
                  const tenantName = prompt('Tenant Name (e.g., "City Central Pharmacy"):');
                  const subdomain = prompt('Subdomain (e.g., "citycentral"):');
                  const subscriptionPlan = prompt('Subscription Plan (starter/professional/enterprise):') as 'starter' | 'professional' | 'enterprise';

                  if (!tenantName || !subdomain || !subscriptionPlan) {
                    alert('Please fill in all tenant details.');
                    return;
                  }

                  const adminFirstName = prompt('Admin First Name:');
                  const adminLastName = prompt('Admin Last Name:');
                  const adminEmail = prompt('Admin Email:');
                  const adminPassword = prompt('Admin Password:') || 'admin123';

                  if (!adminFirstName || !adminLastName || !adminEmail) {
                    alert('Please fill in all admin details.');
                    return;
                  }

                  const contactPhone = prompt('Contact Phone (optional):');
                  const city = prompt('City (optional):');
                  const country = prompt('Country (optional):');

                  try {
                    const response = await fetch('/api/tenants/create', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        tenantName,
                        subdomain: subdomain.toLowerCase(),
                        subscriptionPlan,
                        adminFirstName,
                        adminLastName,
                        adminEmail,
                        adminPassword,
                        contactEmail: adminEmail,
                        contactPhone,
                        city,
                        country
                      })
                    });

                    if (response.ok) {
                      const result = await response.json();
                      loadData();
                      alert(`Tenant "${result.tenant.name}" created successfully!\\nAdmin: ${result.admin.email}\\nPassword: ${adminPassword}`);
                    } else {
                      const error = await response.json();
                      alert(`Error: ${error.error}`);
                    }
                  } catch (error) {
                    console.error('Error creating tenant:', error);
                    alert('Error creating tenant. Please try again.');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Create Tenant
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subdomain
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenants.map((tenant) => {
                      const tenantUsers = users.filter(u => u.tenantId === tenant._id);
                      return (
                        <tr key={tenant._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                              <div className="text-sm text-gray-500">{tenant.contact.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{tenant.subdomain}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionColor(tenant.subscriptionPlan)}`}>
                              {tenant.subscriptionPlan.charAt(0).toUpperCase() + tenant.subscriptionPlan.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.isActive)}`}>
                              {tenant.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tenantUsers.length} users
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(tenant.createdAt).toLocaleDateString()}
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-yellow-600">⚠️ Each tenant must have at least one admin user</p>
                <p className="text-sm text-gray-500">Create tenants first, then add users to them</p>
              </div>
              <button
                onClick={async () => {
                  if (tenants.length === 0) {
                    alert('No tenants available. Please create a tenant first.');
                    return;
                  }

                  const tenantOptions = tenants.map(t => `${t.name} (${t.subdomain})`).join('\n');
                  const selectedTenant = prompt(`Select tenant:\n${tenantOptions}\n\nEnter tenant name:`);
                  const tenant = tenants.find(t => t.name === selectedTenant);

                  if (!tenant) {
                    alert('Invalid tenant selected.');
                    return;
                  }

                  const username = prompt('Username:');
                  const email = prompt('Email:');
                  const firstName = prompt('First Name:');
                  const lastName = prompt('Last Name:');
                  const password = prompt('Password:') || 'password123';
                  const role = prompt('Role (admin/pharmacist/cashier/viewer):') as 'admin' | 'pharmacist' | 'cashier' | 'viewer';

                  if (username && email && firstName && lastName && role) {
                    try {
                      const response = await fetch('/api/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          tenantId: tenant._id,
                          username,
                          email,
                          firstName,
                          lastName,
                          password,
                          role,
                          permissions: []
                        })
                      });

                      if (response.ok) {
                        loadData();
                        alert('User created successfully!');
                      } else {
                        const error = await response.json();
                        alert(`Error: ${error.error}`);
                      }
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
                    {users.map((targetUser) => {
                      const userTenant = tenants.find(t => t._id === targetUser.tenantId);
                      return (
                        <tr key={targetUser._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">{targetUser.firstName} {targetUser.lastName}</div>
                                {targetUser.email === 'kidayos2014@gmail.com' && (
                                  <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                    👑 Super Admin
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{targetUser.email}</div>
                              <div className="text-xs text-gray-400">@{targetUser.username}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {targetUser.role.charAt(0).toUpperCase() + targetUser.role.slice(1)}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {userTenant?.name || 'Unknown Tenant'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(targetUser.isActive)}`}>
                              {targetUser.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {targetUser.security?.lastLogin ? new Date(targetUser.security.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(targetUser.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/users/${targetUser._id}?tenantId=${targetUser.tenantId}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      tenantId: targetUser.tenantId,
                                      isActive: !targetUser.isActive
                                    })
                                  });

                                  if (response.ok) {
                                    loadData();
                                  } else {
                                    const error = await response.json();
                                    alert(`Failed to update user status: ${error.error}`);
                                  }
                                } catch (error) {
                                  console.error('Error updating user:', error);
                                  alert('Error updating user');
                                }
                              }}
                              className={`${targetUser.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                                }`}
                            >
                              {targetUser.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this user?')) {
                                  try {
                                    const response = await fetch(`/api/users/${targetUser._id}?tenantId=${targetUser.tenantId}`, {
                                      method: 'DELETE'
                                    });

                                    if (response.ok) {
                                      loadData();
                                      alert('User deleted successfully');
                                    } else {
                                      const error = await response.json();
                                      alert(`Failed to delete user: ${error.error}`);
                                    }
                                  } catch (error) {
                                    console.error('Error deleting user:', error);
                                    alert('Error deleting user');
                                  }
                                }
                              }}
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


      </main>
    </div>
  );
}