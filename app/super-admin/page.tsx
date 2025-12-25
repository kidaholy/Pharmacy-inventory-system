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
  settings?: {
    branding?: {
      logo?: string;
    };
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-medi-green rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-lg">MH</span>
          </div>
          <p className="text-slate-600 font-medium">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-medi-green shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">👑</span>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-white">MediHeal Admin</h1>
                <p className="text-xs text-white/70">System Control Panel</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-white/80 font-medium">Welcome, {user.firstName}</span>
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-white/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="border-b border-slate-100">
            <nav className="flex space-x-1 p-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-6 rounded-xl font-semibold text-sm transition-all ${activeTab === 'overview'
                  ? 'bg-medi-green text-white shadow-lg shadow-medi-green/20'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                System Overview
              </button>
              <button
                onClick={() => setActiveTab('tenants')}
                className={`py-3 px-6 rounded-xl font-semibold text-sm transition-all ${activeTab === 'tenants'
                  ? 'bg-medi-green text-white shadow-lg shadow-medi-green/20'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                Tenant Management
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-3 px-6 rounded-xl font-semibold text-sm transition-all ${activeTab === 'users'
                  ? 'bg-medi-green text-white shadow-lg shadow-medi-green/20'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                User Management
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* No Tenants Warning */}
            {stats.totalTenants === 0 && (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <span className="text-amber-600 text-xl">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-amber-800">No Pharmacy Tenants Registered</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>The system is ready, but no pharmacy tenants have been created yet.</p>
                      <p className="mt-2 font-semibold">Next steps:</p>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        <li>Go to the "Tenant Management" tab</li>
                        <li>Click "Create Tenant" to add your first pharmacy</li>
                        <li>Each tenant will automatically get an admin user</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Total Tenants</p>
                    <p className="text-3xl font-extrabold text-slate-900">{stats.totalTenants || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏪</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Active Tenants</p>
                    <p className="text-3xl font-extrabold text-medi-green">{stats.activeTenants || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Total Users</p>
                    <p className="text-3xl font-extrabold text-slate-900">{stats.totalUsers || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Active Users</p>
                    <p className="text-3xl font-extrabold text-slate-900">{stats.activeUsers || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Subscription Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="text-3xl font-extrabold text-blue-600">{tenants.filter(t => t.subscriptionPlan === 'starter').length}</div>
                  <div className="text-sm font-bold text-blue-800 mt-1">Starter Plan</div>
                  <div className="text-xs text-blue-600 mt-1">{formatCurrency(29)}/month</div>
                </div>
                <div className="text-center p-6 bg-medi-green/10 rounded-2xl border border-medi-green/20">
                  <div className="text-3xl font-extrabold text-medi-green">{tenants.filter(t => t.subscriptionPlan === 'professional').length}</div>
                  <div className="text-sm font-bold text-medi-green mt-1">Professional Plan</div>
                  <div className="text-xs text-medi-green mt-1">{formatCurrency(79)}/month</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-2xl border border-purple-100">
                  <div className="text-3xl font-extrabold text-purple-600">{tenants.filter(t => t.subscriptionPlan === 'enterprise').length}</div>
                  <div className="text-sm font-bold text-purple-800 mt-1">Enterprise Plan</div>
                  <div className="text-xs text-purple-600 mt-1">{formatCurrency(199)}/month</div>
                </div>
              </div>
            </div>

            {/* Registered Pharmacies Section */}
            {tenants.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Registered Pharmacies</h3>
                    <p className="text-sm text-slate-500 mt-1">All pharmacy tenants in the system</p>
                  </div>
                  <div className="text-sm font-semibold text-medi-green">
                    {tenants.length} {tenants.length === 1 ? 'Pharmacy' : 'Pharmacies'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tenants.map((tenant) => {
                    const userCount = users.filter(u => u.tenantId?.toString() === tenant._id?.toString()).length;
                    const isOwner = users.find(u => u._id?.toString() === tenant.ownerId?.toString());

                    return (
                      <div
                        key={tenant._id}
                        className={`relative group bg-gradient-to-br ${tenant.isActive
                            ? 'from-white to-slate-50 border-slate-200'
                            : 'from-slate-100 to-slate-200 border-slate-300'
                          } border-2 rounded-xl p-5 hover:shadow-lg transition-all duration-300 ${tenant.isActive ? 'hover:border-medi-green' : ''
                          }`}
                      >
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${tenant.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                            }`}>
                            {tenant.isActive ? '● Active' : '● Inactive'}
                          </span>
                        </div>
                        
                        {/* Logo Display */}
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                          {tenant.settings?.branding?.logo ? (
                            <img 
                              src={tenant.settings.branding.logo} 
                              alt={`${tenant.name} logo`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to default icon if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full bg-gradient-to-br from-medi-green to-emerald-600 rounded-2xl flex items-center justify-center ${tenant.settings?.branding?.logo ? 'hidden' : ''}`}>
                            <span className="text-2xl">🏥</span>
                          </div>
                        </div>
                        
                        <h4 className="text-lg font-bold text-slate-900 mb-1 pr-16">
                          {tenant.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="text-xs text-slate-500">🌐</span>
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                            {tenant.subdomain}
                          </code>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 font-medium">Plan:</span>
                            <span className={`font-bold px-2 py-0.5 rounded ${tenant.subscriptionPlan === 'starter' ? 'bg-blue-100 text-blue-700' :
                                tenant.subscriptionPlan === 'professional' ? 'bg-green-100 text-green-700' :
                                  'bg-purple-100 text-purple-700'
                              }`}>
                              {tenant.subscriptionPlan.charAt(0).toUpperCase() + tenant.subscriptionPlan.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 font-medium">Users:</span>
                            <span className="font-bold text-slate-700">{userCount} {userCount === 1 ? 'user' : 'users'}</span>
                          </div>
                          {isOwner && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500 font-medium">Owner:</span>
                              <span className="font-semibold text-slate-700 truncate ml-2">
                                {isOwner.firstName} {isOwner.lastName}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 font-medium">Created:</span>
                            <span className="text-slate-600">
                              {new Date(tenant.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-200">
                          <button
                            onClick={() => setActiveTab('tenants')}
                            className="w-full text-center text-sm font-semibold text-medi-green hover:text-emerald-700 transition-colors"
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tenants' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Tenant Management</h3>
                {tenants.length === 0 && (
                  <p className="text-sm text-red-600 mt-1 font-medium">⚠️ No tenants exist. Regular users cannot login until tenants are created.</p>
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
                className="bg-medi-green hover:bg-medi-green/90 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-medi-green/20"
              >
                + Create Tenant
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Subdomain</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Users</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {tenants.map((tenant) => {
                      const tenantUsers = users.filter(u => u.tenantId === tenant._id);
                      return (
                        <tr key={tenant._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {/* Logo Display */}
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                                {tenant.settings?.branding?.logo ? (
                                  <img 
                                    src={tenant.settings.branding.logo} 
                                    alt={`${tenant.name} logo`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback to default icon if image fails to load
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full bg-gradient-to-br from-medi-green to-emerald-600 rounded-lg flex items-center justify-center ${tenant.settings?.branding?.logo ? 'hidden' : ''}`}>
                                  <span className="text-lg">🏥</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900">{tenant.name}</div>
                                <div className="text-sm text-slate-500">{tenant.contact.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono">{tenant.subdomain}</code>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getSubscriptionColor(tenant.subscriptionPlan)}`}>
                              {tenant.subscriptionPlan.charAt(0).toUpperCase() + tenant.subscriptionPlan.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(tenant.isActive)}`}>
                              {tenant.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                            {tenantUsers.length} users
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
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
                <h3 className="text-xl font-bold text-slate-900">User Management</h3>
                <p className="text-sm text-amber-600 font-medium mt-1">⚠️ Each tenant must have at least one admin user</p>
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
                className="bg-medi-green hover:bg-medi-green/90 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-medi-green/20"
              >
                + Add User
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {users.map((targetUser) => {
                      const userTenant = tenants.find(t => t._id === targetUser.tenantId);
                      return (
                        <tr key={targetUser._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-medi-green/10 rounded-full flex items-center justify-center mr-3">
                                <span className="text-medi-green font-bold text-sm">{targetUser.firstName?.[0]}{targetUser.lastName?.[0]}</span>
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <span className="text-sm font-bold text-slate-900">{targetUser.firstName} {targetUser.lastName}</span>
                                  {targetUser.email === 'kidayos2014@gmail.com' && (
                                    <span className="ml-2 inline-flex px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">👑 Super</span>
                                  )}
                                </div>
                                <div className="text-sm text-slate-500">{targetUser.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                                {targetUser.role.charAt(0).toUpperCase() + targetUser.role.slice(1)}
                              </span>
                              <div className="text-xs text-slate-400 mt-1">{userTenant?.name || 'Unknown'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(targetUser.isActive)}`}>
                              {targetUser.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {targetUser.security?.lastLogin ? new Date(targetUser.security.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(targetUser.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
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
                              className={`font-semibold ${targetUser.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-medi-green hover:text-medi-green/80'}`}
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
                              className="text-red-600 hover:text-red-700 font-semibold"
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