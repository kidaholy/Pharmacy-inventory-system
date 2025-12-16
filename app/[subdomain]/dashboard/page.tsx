'use client';

import { useState, useEffect } from 'react';
import { auth, User } from '../../../lib/auth';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface TenantStats {
  totalMedicines: number;
  totalUsers: number;
  lowStockCount: number;
  expiringCount: number;
  pendingPrescriptions: number;
  totalInventoryValue: number;
}

interface TenantInfo {
  _id: string;
  name: string;
  subdomain: string;
  subscriptionPlan: string;
  contact: {
    email: string;
    phone?: string;
    city?: string;
    country?: string;
  };
}

export default function TenantDashboardPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const currentUser = auth.requireAuth();
    if (!currentUser) {
      return;
    }

    setUser(currentUser);
    loadDashboardData(currentUser);
  }, [subdomain]);

  const loadDashboardData = async (currentUser: User) => {
    try {
      setLoading(true);
      setError(null);

      // Verify user belongs to this tenant subdomain
      if (currentUser.tenantSubdomain !== subdomain) {
        setError(`Access denied. You don't have permission to access ${subdomain} dashboard.`);
        setLoading(false);
        return;
      }

      console.log('📊 Loading dashboard data for subdomain:', subdomain);

      // Load tenant information using subdomain
      const tenantResponse = await fetch(`/api/tenant/${subdomain}`);
      if (tenantResponse.ok) {
        const tenantData = await tenantResponse.json();
        setTenantInfo(tenantData);
        console.log('✅ Tenant info loaded:', tenantData.name);
      } else {
        console.error('❌ Failed to load tenant info');
        setError('Failed to load pharmacy information');
      }

      // Load tenant statistics using subdomain
      const statsResponse = await fetch(`/api/tenant/${subdomain}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
        console.log('✅ Stats loaded:', statsData);
      } else {
        console.error('❌ Failed to load stats');
        // Set default stats if API fails
        setStats({
          totalMedicines: 0,
          totalUsers: 1,
          lowStockCount: 0,
          expiringCount: 0,
          pendingPrescriptions: 0,
          totalInventoryValue: 0
        });
      }

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      // Set default stats on error
      setStats({
        totalMedicines: 0,
        totalUsers: 1,
        lowStockCount: 0,
        expiringCount: 0,
        pendingPrescriptions: 0,
        totalInventoryValue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Update document title based on tenant info
  useEffect(() => {
    if (tenantInfo) {
      document.title = `${tenantInfo.name} - Dashboard`;
    } else {
      document.title = `${subdomain} - Dashboard`;
    }
  }, [tenantInfo, subdomain]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      auth.logout();
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading {subdomain} dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">💊</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">
                {tenantInfo ? `${tenantInfo.name} - Dashboard` : `${subdomain} - Dashboard`}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.firstName} {user.lastName}</span>
              <Link href={`/${subdomain}/help`}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Help
                </button>
              </Link>
              <Link href={`/${subdomain}/settings`}>
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Settings
                </button>
              </Link>
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {tenantInfo ? `${tenantInfo.name} Dashboard` : `${subdomain} Dashboard`}
          </h2>
          <p className="text-gray-600">
            {tenantInfo ? `Welcome to ${tenantInfo.name} management system` : `Welcome to ${subdomain} management system`}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-8">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Tenant Information */}
        {tenantInfo && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">{tenantInfo.name}</h3>
                <p className="text-blue-100">
                  {tenantInfo.subdomain}.pharmatrack.com • {tenantInfo.subscriptionPlan} plan
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  {tenantInfo.contact.city}, {tenantInfo.contact.country}
                </p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🏥</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : (stats?.totalMedicines || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : `${(stats?.totalInventoryValue || 0).toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : (stats?.lowStockCount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : (stats?.pendingPrescriptions || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back, {user.firstName}!
          </h3>
          <p className="text-gray-600 mb-6">
            {tenantInfo ? 
              `Managing ${tenantInfo.name} • Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` :
              `Managing ${subdomain} • Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`
            }
          </p>
          <div className="flex justify-center space-x-4">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✅ System Online
            </div>
            {tenantInfo && (
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                🏥 {tenantInfo.subscriptionPlan.charAt(0).toUpperCase() + tenantInfo.subscriptionPlan.slice(1)} Plan
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link href={`/${subdomain}/inventory`} className="flex items-center p-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <span className="text-xl mr-3">💊</span>
              <span className="font-medium">Inventory</span>
            </Link>
            <Link href={`/${subdomain}/prescriptions`} className="flex items-center p-3 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span className="text-xl mr-3">📋</span>
              <span className="font-medium">Prescriptions</span>
            </Link>
            <Link href={`/${subdomain}/patients`} className="flex items-center p-3 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <span className="text-xl mr-3">👥</span>
              <span className="font-medium">Patients</span>
            </Link>
            <Link href={`/${subdomain}/reports`} className="flex items-center p-3 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <span className="text-xl mr-3">📊</span>
              <span className="font-medium">Reports</span>
            </Link>
            <Link href={`/${subdomain}/settings`} className="flex items-center p-3 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-xl mr-3">⚙️</span>
              <span className="font-medium">Settings</span>
            </Link>
            <Link href={`/${subdomain}/help`} className="flex items-center p-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <span className="text-xl mr-3">❓</span>
              <span className="font-medium">Help</span>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Inventory</h3>
              <p className="text-gray-600 text-sm mb-4">Track and manage your medicine inventory</p>
              <Link href={`/${subdomain}/inventory`}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Go to Inventory
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Prescriptions</h3>
              <p className="text-gray-600 text-sm mb-4">Manage patient prescriptions and orders</p>
              <Link href={`/${subdomain}/prescriptions`}>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  View Prescriptions
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports</h3>
              <p className="text-gray-600 text-sm mb-4">Generate sales and inventory reports</p>
              <Link href={`/${subdomain}/reports`}>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  View Reports
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}