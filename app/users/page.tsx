'use client';

import { useState, useEffect } from 'react';
import { auth, User } from '../../lib/auth';
import Link from 'next/link';

export default function UsersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const currentUser = auth.requireAuth();
    if (!currentUser) {
      return;
    }

    // Redirect regular users to their tenant-specific dashboard
    if (currentUser.role !== 'super_admin' && currentUser.tenantSubdomain) {
      window.location.href = `/${currentUser.tenantSubdomain}/dashboard`;
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, []);

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

  // Only super admin should access this page
  if (user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Access Denied</div>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            Return to Dashboard
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
                <span className="text-white font-bold">👥</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">User Management</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/super-admin">
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  👑 Super Admin
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">System Users</h2>
          <p className="text-gray-600">Manage users across all pharmacy tenants</p>
        </div>

        {/* Super Admin Notice */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-8">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 text-sm font-medium">
              Super Admin Access: You can manage users across all pharmacy tenants
            </span>
          </div>
        </div>

        {/* User Management Interface */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">User Management Interface</h3>
            <p className="text-gray-600 mb-6">
              This page will contain the user management interface for super admins to manage users across all pharmacy tenants.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/super-admin">
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  👑 Super Admin Panel
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  📊 Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}