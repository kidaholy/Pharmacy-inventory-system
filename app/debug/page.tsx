'use client';

import { useState } from 'react';
import { db } from '../../lib/database-safe';
import Link from 'next/link';

export default function DebugPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const resetDatabase = async () => {
    await db.resetDatabase();
    setMessage('Database reset successfully! All sample data has been reinitialized.');
    loadUsers();
  };

  const loadUsers = async () => {
    const allUsers = await db.debugPrintUsers();
    setUsers(allUsers);
    console.log('Users loaded:', allUsers);
  };

  const testLogin = async (email: string, password: string) => {
    const user = await db.getUserByCredentials(email, password);
    if (user) {
      setMessage(`✅ Login successful for ${email} - Role: ${user.role}`);
    } else {
      setMessage(`❌ Login failed for ${email}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Database Debug Panel</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Home
            </Link>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">{message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={resetDatabase}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🔄 Reset Database
            </button>
            <button
              onClick={loadUsers}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              👥 Load All Users
            </button>
            <button
              onClick={async () => {
                try {
                  const reconnected = await db.forceAtlasReconnect();
                  setMessage(reconnected ? '✅ Atlas reconnected successfully!' : '⚠️ Atlas unavailable, using localStorage');
                } catch (error) {
                  setMessage('❌ Atlas connection failed');
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🔗 Test Atlas
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => testLogin('superadmin@pharmatrack.com', 'SuperAdmin123!')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Test Super Admin Login
            </button>
            <button
              onClick={() => testLogin('admin@pharmatrack.com', 'password')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Test Demo User Login
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Status</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Connection Status</h3>
                  <p className="text-sm text-gray-600">
                    {db.isUsingAtlas() ? '🟢 Connected to MongoDB Atlas' : '🟡 Using localStorage fallback'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  db.isUsingAtlas() ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {db.isUsingAtlas() ? 'Atlas' : 'Local'}
                </div>
              </div>
            </div>
            
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Credentials</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Super Admin</h3>
                  <p className="text-sm text-gray-600">Email: superadmin@pharmatrack.com</p>
                  <p className="text-sm text-gray-600">Password: SuperAdmin123!</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Demo User</h3>
                  <p className="text-sm text-gray-600">Email: admin@pharmatrack.com</p>
                  <p className="text-sm text-gray-600">Password: password</p>
                </div>
              </div>
            </div>
          </div>

          {users.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">All Users in Database</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Password
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.password}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'super_admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
              <li>Click "Reset Database" to clear and reinitialize all data</li>
              <li>Click "Load All Users" to see all users in the database</li>
              <li>Use the test buttons to verify login credentials work</li>
              <li>Go to <Link href="/login" className="underline">/login</Link> to test actual login</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}