'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/auth';
import { User } from '../../lib/database';
import Link from 'next/link';

interface SalesData {
  date: string;
  revenue: number;
  prescriptions: number;
  items: number;
}

interface TopMedicine {
  name: string;
  quantity: number;
  revenue: number;
}

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [reportType, setReportType] = useState('sales');

  // Sample data
  const salesData: SalesData[] = [
    { date: '2024-12-09', revenue: 1250.50, prescriptions: 45, items: 127 },
    { date: '2024-12-10', revenue: 1890.75, prescriptions: 62, items: 189 },
    { date: '2024-12-11', revenue: 2100.25, prescriptions: 71, items: 203 },
    { date: '2024-12-12', revenue: 1675.00, prescriptions: 58, items: 165 },
    { date: '2024-12-13', revenue: 2350.80, prescriptions: 79, items: 234 },
    { date: '2024-12-14', revenue: 1980.45, prescriptions: 67, items: 198 },
    { date: '2024-12-15', revenue: 2847.30, prescriptions: 89, items: 267 }
  ];

  const topMedicines: TopMedicine[] = [
    { name: 'Paracetamol 500mg', quantity: 245, revenue: 612.50 },
    { name: 'Amoxicillin 250mg', quantity: 89, revenue: 778.75 },
    { name: 'Ibuprofen 400mg', quantity: 156, revenue: 507.00 },
    { name: 'Omeprazole 20mg', quantity: 67, revenue: 837.50 },
    { name: 'Cetirizine 10mg', quantity: 134, revenue: 670.00 }
  ];

  const lowStockItems = [
    { name: 'Amoxicillin 250mg', current: 25, minimum: 30, status: 'critical' },
    { name: 'Cetirizine 10mg', current: 15, minimum: 25, status: 'critical' },
    { name: 'Aspirin 75mg', current: 35, minimum: 40, status: 'low' },
    { name: 'Metformin 500mg', current: 42, minimum: 50, status: 'low' }
  ];

  useEffect(() => {
    const currentUser = auth.requireAuth();
    if (!currentUser) {
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, []);

  const getTotalRevenue = () => {
    return salesData.reduce((sum, day) => sum + day.revenue, 0);
  };

  const getTotalPrescriptions = () => {
    return salesData.reduce((sum, day) => sum + day.prescriptions, 0);
  };

  const getAverageDaily = () => {
    return getTotalRevenue() / salesData.length;
  };

  const getGrowthRate = () => {
    if (salesData.length < 2) return 0;
    const firstDay = salesData[0].revenue;
    const lastDay = salesData[salesData.length - 1].revenue;
    return ((lastDay - firstDay) / firstDay) * 100;
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
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Dashboard
              </Link>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sales">Sales Report</option>
                <option value="inventory">Inventory Report</option>
                <option value="prescriptions">Prescription Report</option>
                <option value="financial">Financial Summary</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 3 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Generate Report
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${getTotalRevenue().toFixed(2)}</p>
                <p className="text-xs text-green-600">+{getGrowthRate().toFixed(1)}% from last period</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalPrescriptions()}</p>
                <p className="text-xs text-blue-600">Avg: {Math.round(getTotalPrescriptions() / salesData.length)}/day</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Daily Average</p>
                <p className="text-2xl font-bold text-gray-900">${getAverageDaily().toFixed(2)}</p>
                <p className="text-xs text-purple-600">Per day revenue</p>
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
                <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
                <p className="text-xs text-yellow-600">Need attention</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales Trend</h3>
            <div className="space-y-3">
              {salesData.map((day, index) => {
                const maxRevenue = Math.max(...salesData.map(d => d.revenue));
                const percentage = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={day.date} className="flex items-center">
                    <div className="w-20 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="bg-gray-200 rounded-full h-4 relative">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-20 text-sm font-medium text-gray-900 text-right">
                      ${day.revenue.toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Medicines */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Medicines</h3>
            <div className="space-y-4">
              {topMedicines.map((medicine, index) => (
                <div key={medicine.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{medicine.name}</p>
                      <p className="text-sm text-gray-600">{medicine.quantity} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${medicine.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-yellow-500 mr-2">⚠️</span>
            Low Stock Alert
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Current Stock: {item.current}</span>
                  <span>Minimum: {item.minimum}</span>
                </div>
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.status === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${(item.current / item.minimum) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Sales Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Daily Sales Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prescriptions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg per Prescription
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${day.revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day.prescriptions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day.items}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(day.revenue / day.prescriptions).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}