'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '../../../components/TenantLayout';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    TruckIcon,
    CubeIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Purchase {
    _id: string;
    poNumber: string;
    supplier: string;
    items: number;
    total: number;
    status: 'pending' | 'received' | 'cancelled';
    expectedDate: string;
    createdAt: string;
}

export default function PurchasesPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadPurchases();
    }, [subdomain]);

    const loadPurchases = async () => {
        try {
            setLoading(true);
            // Sample data for now
            setPurchases([
                { _id: '1', poNumber: 'PO-001', supplier: 'MedSupply Co.', items: 50, total: 2500.00, status: 'received', expectedDate: new Date().toISOString(), createdAt: new Date().toISOString() },
                { _id: '2', poNumber: 'PO-002', supplier: 'PharmaCorp', items: 30, total: 1800.00, status: 'pending', expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
                { _id: '3', poNumber: 'PO-003', supplier: 'HealthDist Ltd', items: 25, total: 1200.00, status: 'pending', expectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
            ]);
        } catch (error) {
            console.error('Failed to load purchases:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPurchases = purchases.filter(p => {
        const matchesSearch = p.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.supplier.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <TenantLayout title="Purchases" subtitle="Manage purchase orders and supplier deliveries">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Orders</p>
                            <p className="text-2xl font-bold text-slate-900">{purchases.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-medi-green/10 rounded-xl flex items-center justify-center">
                            <TruckIcon className="w-6 h-6 text-medi-green" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Pending</p>
                            <p className="text-2xl font-bold text-amber-600">{purchases.filter(p => p.status === 'pending').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <ClockIcon className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Received</p>
                            <p className="text-2xl font-bold text-green-600">{purchases.filter(p => p.status === 'received').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Items Ordered</p>
                            <p className="text-2xl font-bold text-slate-900">{purchases.reduce((sum, p) => sum + p.items, 0)}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <CubeIcon className="w-6 h-6 text-blue-600" />
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
                            placeholder="Search by PO number or supplier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="received">Received</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        <ArrowDownTrayIcon className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">Export</span>
                    </button>
                    <Link href={`/${subdomain}/purchases/new`}>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-medi-green text-white rounded-xl hover:bg-medi-green/90 transition-colors shadow-lg shadow-medi-green/20">
                            <PlusIcon className="w-5 h-5" />
                            <span className="text-sm font-semibold">New Purchase Order</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Purchases Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">PO Number</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-medi-green border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPurchases.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <TruckIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium">No purchase orders found</p>
                                        <p className="text-slate-400 text-sm">Create your first purchase order</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPurchases.map((purchase) => (
                                    <tr key={purchase._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-medi-green">{purchase.poNumber}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 font-medium">{purchase.supplier}</td>
                                        <td className="px-6 py-4 text-slate-600">{purchase.items}</td>
                                        <td className="px-6 py-4 text-slate-900 font-bold">${purchase.total.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(purchase.expectedDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${purchase.status === 'received' ? 'bg-green-100 text-green-700' :
                                                    purchase.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {purchase.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <EyeIcon className="w-4 h-4 text-slate-500" />
                                                </button>
                                                {purchase.status === 'pending' && (
                                                    <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                    </button>
                                                )}
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
