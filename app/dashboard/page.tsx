'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/auth';
import { User } from '../../lib/database';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const currentUser = auth.requireAuth();
    if (!currentUser) {
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      auth.logout();
      window.location.href = '/';
    }
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
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">💊</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">PharmaTrack Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
              {user.role === 'super_admin' && (
                <Link href="/super-admin">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    👑 Super Admin
                  </button>
                </Link>
              )}
              <Link href="/help">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Help
                </button>
              </Link>
              <Link href="/settings">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Welcome to your pharmacy management system</p>
        </div>

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
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
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
                <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                <p className="text-2xl font-bold text-gray-900">$2,847</p>
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
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
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
                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                <p className="text-2xl font-bold text-gray-900">456</p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to PharmaTrack!
          </h3>
          <p className="text-gray-600 mb-6">
            You have successfully logged in. This is your pharmacy management dashboard.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            ✅ System Online
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link href="/inventory" className="flex items-center p-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <span className="text-xl mr-3">💊</span>
              <span className="font-medium">Inventory</span>
            </Link>
            <Link href="/prescriptions" className="flex items-center p-3 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span className="text-xl mr-3">📋</span>
              <span className="font-medium">Prescriptions</span>
            </Link>
            <Link href="/patients" className="flex items-center p-3 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <span className="text-xl mr-3">👥</span>
              <span className="font-medium">Patients</span>
            </Link>
            <Link href="/reports" className="flex items-center p-3 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <span className="text-xl mr-3">📊</span>
              <span className="font-medium">Reports</span>
            </Link>
            <Link href="/settings" className="flex items-center p-3 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-xl mr-3">⚙️</span>
              <span className="font-medium">Settings</span>
            </Link>
            <Link href="/help" className="flex items-center p-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
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
              <Link href="/inventory">
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
              <Link href="/prescriptions">
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
              <Link href="/reports">
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