'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '../../../components/TenantLayout';
import {
    ArrowDownTrayIcon,
    DocumentChartBarIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    CubeIcon,
    ShoppingCartIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

export default function ReportsPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [dateRange, setDateRange] = useState('month');
    const [reportType, setReportType] = useState('sales');

    const reports = [
        {
            id: 'sales',
            name: 'Sales Report',
            description: 'Detailed breakdown of all sales transactions',
            icon: ShoppingCartIcon,
            color: 'bg-medi-green',
            stats: { value: '$12,450', change: '+15%', up: true }
        },
        {
            id: 'inventory',
            name: 'Inventory Report',
            description: 'Stock levels, movements, and valuations',
            icon: CubeIcon,
            color: 'bg-blue-600',
            stats: { value: '1,234', change: '+8%', up: true }
        },
        {
            id: 'purchases',
            name: 'Purchase Report',
            description: 'All purchase orders and supplier payments',
            icon: DocumentChartBarIcon,
            color: 'bg-purple-600',
            stats: { value: '$8,920', change: '-3%', up: false }
        },
        {
            id: 'profit',
            name: 'Profit & Loss',
            description: 'Revenue, expenses, and net profit analysis',
            icon: CurrencyDollarIcon,
            color: 'bg-emerald-600',
            stats: { value: '$3,530', change: '+22%', up: true }
        },
        {
            id: 'expiry',
            name: 'Expiry Report',
            description: 'Medicines expiring soon or already expired',
            icon: CalendarIcon,
            color: 'bg-amber-500',
            stats: { value: '45', change: '-12%', up: true }
        },
        {
            id: 'trends',
            name: 'Sales Trends',
            description: 'Top selling items and customer trends',
            icon: ChartBarIcon,
            color: 'bg-rose-500',
            stats: { value: '156', change: '+18%', up: true }
        },
    ];

    return (
        <TenantLayout title="Reports" subtitle="Generate and analyze business reports">
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Date Range:</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                            <option value="year">This Year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    <div className="flex-1"></div>

                    <button className="flex items-center gap-2 px-5 py-2.5 bg-medi-green text-white rounded-xl hover:bg-medi-green/90 transition-colors shadow-lg shadow-medi-green/20">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span className="text-sm font-semibold">Export All Reports</span>
                    </button>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <div
                        key={report.id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-14 h-14 ${report.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <report.icon className="w-7 h-7 text-white" />
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${report.stats.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {report.stats.up ? (
                                        <ArrowTrendingUpIcon className="w-3 h-3" />
                                    ) : (
                                        <ArrowTrendingDownIcon className="w-3 h-3" />
                                    )}
                                    {report.stats.change}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1">{report.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">{report.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <span className="text-2xl font-bold text-slate-900">{report.stats.value}</span>
                                <button className="flex items-center gap-2 text-medi-green text-sm font-semibold hover:underline">
                                    <span>View Report</span>
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Summary */}
            <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Summary - This Month</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                        <p className="text-xl font-bold text-slate-900">$12,450</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Total Expenses</p>
                        <p className="text-xl font-bold text-slate-900">$8,920</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Net Profit</p>
                        <p className="text-xl font-bold text-medi-green">$3,530</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Profit Margin</p>
                        <p className="text-xl font-bold text-medi-green">28.4%</p>
                    </div>
                </div>
            </div>
        </TenantLayout>
    );
}
