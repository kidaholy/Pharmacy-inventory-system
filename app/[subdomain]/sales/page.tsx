'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '../../../components/TenantLayout';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    PrinterIcon,
    ShoppingCartIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Sale {
    _id: string;
    invoiceNumber: string;
    customer: string;
    items: number;
    total: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
}

export default function SalesPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('today');

    useEffect(() => {
        loadSales();
    }, [subdomain, dateFilter]);

    const loadSales = async () => {
        try {
            setLoading(true);
            // For now, using sample data
            setSales([
                { _id: '1', invoiceNumber: 'INV-001', customer: 'John Doe', items: 3, total: 125.50, paymentMethod: 'Cash', status: 'completed', createdAt: new Date().toISOString() },
                { _id: '2', invoiceNumber: 'INV-002', customer: 'Jane Smith', items: 5, total: 280.00, paymentMethod: 'Card', status: 'completed', createdAt: new Date().toISOString() },
                { _id: '3', invoiceNumber: 'INV-003', customer: 'Walk-in Customer', items: 2, total: 45.00, paymentMethod: 'Cash', status: 'completed', createdAt: new Date().toISOString() },
            ]);
        } catch (error) {
            console.error('Failed to load sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const todayTotal = sales.reduce((sum, s) => sum + s.total, 0);

    return (
        <TenantLayout title="Sales" subtitle="Track and manage your sales">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Today's Sales</p>
                            <p className="text-2xl font-bold text-medi-green">${todayTotal.toFixed(2)}</p>
                        </div>
                        <div className="w-12 h-12 bg-medi-green/10 rounded-xl flex items-center justify-center">
                            <CurrencyDollarIcon className="w-6 h-6 text-medi-green" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Transactions</p>
                            <p className="text-2xl font-bold text-slate-900">{sales.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Items Sold</p>
                            <p className="text-2xl font-bold text-slate-900">{sales.reduce((sum, s) => sum + s.items, 0)}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <ChartBarIcon className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Avg. Transaction</p>
                            <p className="text-2xl font-bold text-slate-900">${sales.length ? (todayTotal / sales.length).toFixed(2) : '0.00'}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by invoice or customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                        />
                    </div>

                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30"
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="all">All Time</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        <ArrowDownTrayIcon className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">Export</span>
                    </button>
                    <Link href={`/${subdomain}/sales/new`}>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-medi-green text-white rounded-xl hover:bg-medi-green/90 transition-colors shadow-lg shadow-medi-green/20">
                            <PlusIcon className="w-5 h-5" />
                            <span className="text-sm font-semibold">New Sale</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-medi-green border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <ShoppingCartIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium">No sales found</p>
                                        <p className="text-slate-400 text-sm">Create your first sale to get started</p>
                                    </td>
                                </tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-medi-green">{sale.invoiceNumber}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 font-medium">{sale.customer}</td>
                                        <td className="px-6 py-4 text-slate-600">{sale.items}</td>
                                        <td className="px-6 py-4 text-slate-900 font-bold">${sale.total.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sale.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {sale.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(sale.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold capitalize">
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <EyeIcon className="w-4 h-4 text-slate-500" />
                                                </button>
                                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <PrinterIcon className="w-4 h-4 text-slate-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </TenantLayout>
    );
}
