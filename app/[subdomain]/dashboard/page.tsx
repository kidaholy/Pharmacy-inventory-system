'use client';

import { useState, useEffect } from 'react';
import { auth, User } from '../../../lib/auth';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChartBarIcon,
  CubeIcon,
  ShoppingCartIcon,
  TruckIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronLeftIcon,
  PlusIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import ChartPlaceholder from '../../../components/ui/chart-placeholder';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-xl">
              <span className="text-white font-bold text-2xl">💊</span>
            </div>
            <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-blue-500 via-teal-500 to-cyan-500 rounded-2xl animate-ping opacity-20 mx-auto"></div>
          </div>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Loading Dashboard
          </h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Preparing {subdomain} management system...
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Access Denied
          </h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            {error}
          </p>
          <Link href="/login" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-slate-50'}`}>
      <div className="flex">
        {/* Left Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'} border-r transition-all duration-300 flex flex-col shadow-lg`}>
          {/* Sidebar Header */}
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-medi-green rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">MH</span>
                  </div>
                  <div className="ml-3">
                    <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {tenantInfo ? tenantInfo.name : subdomain}
                    </h1>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      Pharmacy Dashboard
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-slate-100 text-slate-500'} transition-colors`}
              >
                <ChevronLeftIcon className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            <Link href={`/${subdomain}/dashboard`} className={`flex items-center px-4 py-3 ${darkMode ? 'text-medi-lime bg-medi-green/20' : 'text-medi-green bg-medi-green/10'} rounded-xl font-semibold transition-colors`}>
              <ChartBarIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
            </Link>
            <Link href={`/${subdomain}/inventory`} className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} rounded-xl transition-colors`}>
              <CubeIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Inventory</span>}
            </Link>
            <Link href={`/${subdomain}/sales`} className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} rounded-xl transition-colors`}>
              <ShoppingCartIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Sales</span>}
            </Link>
            <Link href={`/${subdomain}/purchases`} className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} rounded-xl transition-colors`}>
              <TruckIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Purchases</span>}
            </Link>
            <Link href={`/${subdomain}/customers`} className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} rounded-xl transition-colors`}>
              <UsersIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Customers</span>}
            </Link>
            <Link href={`/${subdomain}/suppliers`} className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} rounded-xl transition-colors`}>
              <BuildingStorefrontIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Suppliers</span>}
            </Link>
            <Link href={`/${subdomain}/reports`} className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} rounded-xl transition-colors`}>
              <DocumentChartBarIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Reports</span>}
            </Link>
            <Link href={`/${subdomain}/settings`} className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} rounded-xl transition-colors`}>
              <Cog6ToothIcon className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Settings</span>}
            </Link>
          </nav>

          {/* Sidebar Footer */}
          {!sidebarCollapsed && (
            <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-slate-100'}`}>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-medi-green/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Storage Used</span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-medi-green'}`}>68%</span>
                </div>
                <div className={`w-full bg-slate-200 rounded-full h-2 ${darkMode ? 'bg-gray-600' : ''}`}>
                  <div className="bg-medi-green h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  2.1 GB of 3 GB used
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'} border-b px-6 py-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Dashboard
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                    Welcome back, {user?.firstName}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative">
                  <MagnifyingGlassIcon className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-slate-400'} absolute left-3 top-1/2 transform -translate-y-1/2`} />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className={`pl-10 pr-4 py-2.5 w-80 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green transition-colors`}
                  />
                </div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2.5 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition-colors`}
                >
                  {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className={`relative p-2.5 rounded-xl ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-slate-600 hover:bg-slate-100'} transition-colors`}>
                  <BellIcon className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className={`flex items-center space-x-3 p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50'} transition-colors`}
                  >
                    <div className="w-10 h-10 bg-medi-green rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">{user?.firstName?.[0]}</span>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'} capitalize`}>
                        {user?.role}
                      </p>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`} />
                  </button>

                  {showUserDropdown && (
                    <div className={`absolute right-0 mt-2 w-56 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'} rounded-xl shadow-xl border py-2 z-50`}>
                      <Link href={`/${subdomain}/profile`} className={`block px-4 py-3 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-slate-700 hover:bg-slate-50'} transition-colors`}>
                        Profile Settings
                      </Link>
                      <Link href={`/${subdomain}/billing`} className={`block px-4 py-3 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-slate-700 hover:bg-slate-50'} transition-colors`}>
                        Billing & Plans
                      </Link>
                      <hr className={`my-2 ${darkMode ? 'border-gray-700' : 'border-slate-100'}`} />
                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-3 text-sm ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'} transition-colors`}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-8 overflow-auto">
            {/* Error Display */}
            {error && (
              <div className={`${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border-l-4 p-4 rounded-xl mb-8`}>
                <div className="flex items-center">
                  <ExclamationTriangleIcon className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-500'} mr-3`} />
                  <span className={`${darkMode ? 'text-red-300' : 'text-red-700'} text-sm font-medium`}>{error}</span>
                </div>
              </div>
            )}

            {/* Hero Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Products */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'} rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all duration-300`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-slate-500'} mb-2`}>Total Products</p>
                    <p className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {loading ? '...' : (stats?.totalMedicines || 0)}
                    </p>
                    <div className="flex items-center mt-3">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-medi-green mr-1" />
                      <span className="text-sm text-medi-green font-semibold">+12%</span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'} ml-1`}>vs last month</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-medi-green rounded-2xl flex items-center justify-center shadow-lg">
                    <CubeIcon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'} rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all duration-300`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-slate-500'} mb-2`}>Low Stock Alerts</p>
                    <p className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {loading ? '...' : (stats?.lowStockCount || 0)}
                    </p>
                    <div className="flex items-center mt-3">
                      <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-sm text-amber-600 font-semibold">Needs attention</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <ExclamationTriangleIcon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Today's Sales */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'} rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all duration-300`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-slate-500'} mb-2`}>Today's Sales</p>
                    <p className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>$2,847</p>
                    <div className="flex items-center mt-3">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-medi-green mr-1" />
                      <span className="text-sm text-medi-green font-semibold">+8%</span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'} ml-1`}>vs yesterday</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <ShoppingCartIcon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'} rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all duration-300`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-slate-500'} mb-2`}>Monthly Revenue</p>
                    <p className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      ${loading ? '...' : (stats?.totalInventoryValue || 0).toLocaleString()}
                    </p>
                    <div className="flex items-center mt-3">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-medi-green mr-1" />
                      <span className="text-sm text-medi-green font-semibold">+15%</span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'} ml-1`}>vs last month</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-medi-lime rounded-2xl flex items-center justify-center shadow-lg">
                    <CurrencyDollarIcon className="w-7 h-7 text-medi-green" />
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Sales Chart */}
              <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-sm border`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sales Overview</h3>
                  <select className={`text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 3 months</option>
                  </select>
                </div>
                <ChartPlaceholder
                  title="Sales Overview Chart"
                  type="line"
                  darkMode={darkMode}
                />
              </div>

              {/* Top Selling Medicines */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-sm border`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Top Selling</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold text-sm">1</span>
                      </div>
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Paracetamol 500mg</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>245 units sold</p>
                      </div>
                    </div>
                    <span className="text-emerald-600 font-semibold">$1,225</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                        <span className="text-emerald-600 font-semibold text-sm">2</span>
                      </div>
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ibuprofen 400mg</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>189 units sold</p>
                      </div>
                    </div>
                    <span className="text-emerald-600 font-semibold">$945</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-3">
                        <span className="text-amber-600 font-semibold text-sm">3</span>
                      </div>
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Vitamin C 1000mg</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>156 units sold</p>
                      </div>
                    </div>
                    <span className="text-emerald-600 font-semibold">$780</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity Panel */}
              <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-sm border`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
                </div>
                <div className="space-y-4">
                  {/* Latest Sales Transaction */}
                  <div className={`flex items-center p-4 ${darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'} rounded-xl`}>
                    <div className={`w-10 h-10 ${darkMode ? 'bg-emerald-800' : 'bg-emerald-100'} rounded-xl flex items-center justify-center mr-4`}>
                      <ShoppingCartIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>New sale completed</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Paracetamol 500mg - $25.50 • 2 minutes ago</p>
                    </div>
                    <span className="text-emerald-600 font-semibold">+$25.50</span>
                  </div>

                  {/* Stock Update */}
                  <div className={`flex items-center p-4 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-xl`}>
                    <div className={`w-10 h-10 ${darkMode ? 'bg-blue-800' : 'bg-blue-100'} rounded-xl flex items-center justify-center mr-4`}>
                      <CubeIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Stock updated</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ibuprofen 400mg restocked • 15 minutes ago</p>
                    </div>
                    <span className="text-blue-600 font-semibold">+50 units</span>
                  </div>

                  {/* Expiry Alert */}
                  <div className={`flex items-center p-4 ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'} rounded-xl`}>
                    <div className={`w-10 h-10 ${darkMode ? 'bg-amber-800' : 'bg-amber-100'} rounded-xl flex items-center justify-center mr-4`}>
                      <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Expiry alert</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vitamin D expires in 30 days • 1 hour ago</p>
                    </div>
                    <span className="text-amber-600 font-semibold">30 days</span>
                  </div>

                  {/* New Customer */}
                  <div className={`flex items-center p-4 ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'} rounded-xl`}>
                    <div className={`w-10 h-10 ${darkMode ? 'bg-purple-800' : 'bg-purple-100'} rounded-xl flex items-center justify-center mr-4`}>
                      <UsersIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>New customer registered</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>John Smith joined • 2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-sm border`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Quick Actions</h3>
                <div className="space-y-3">
                  <Link href={`/${subdomain}/inventory/add`}>
                    <button className="w-full flex items-center justify-center px-4 py-3 bg-medi-green text-white rounded-xl hover:bg-medi-green/90 transition-all duration-200 font-semibold shadow-lg shadow-medi-green/20">
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Add Product
                    </button>
                  </Link>
                  <Link href={`/${subdomain}/sales/invoice`}>
                    <button className={`w-full flex items-center justify-center px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} border-2 rounded-xl transition-all duration-200 font-medium`}>
                      <DocumentTextIcon className="w-5 h-5 mr-2" />
                      Create Invoice
                    </button>
                  </Link>
                  <Link href={`/${subdomain}/inventory/restock`}>
                    <button className={`w-full flex items-center justify-center px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} border-2 rounded-xl transition-all duration-200 font-medium`}>
                      <ArrowPathIcon className="w-5 h-5 mr-2" />
                      Restock Items
                    </button>
                  </Link>
                  <Link href={`/${subdomain}/reports`}>
                    <button className={`w-full flex items-center justify-center px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} border-2 rounded-xl transition-all duration-200 font-medium`}>
                      <EyeIcon className="w-5 h-5 mr-2" />
                      View Reports
                    </button>
                  </Link>
                </div>

                {/* System Status */}
                <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>System Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>System Health</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-emerald-600">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Backup</span>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>2 hours ago</span>
                    </div>
                    {tenantInfo && (
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Plan</span>
                        <span className="text-sm font-medium text-blue-600 capitalize">{tenantInfo.subscriptionPlan}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}