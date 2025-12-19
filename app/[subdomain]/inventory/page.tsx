'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '../../../components/TenantLayout';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    PencilIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    CubeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Medicine {
    _id: string;
    name: string;
    genericName?: string;
    category: string;
    manufacturer: string;
    price: number;
    quantity: number;
    expiryDate: string;
    batchNumber: string;
    reorderLevel: number;
}

export default function InventoryPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        loadMedicines();
    }, [subdomain]);

    const loadMedicines = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/tenant/${subdomain}/medicines`);
            if (response.ok) {
                const data = await response.json();
                setMedicines(data.medicines || []);
            }
        } catch (error) {
            console.error('Failed to load medicines:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMedicines = medicines.filter(med => {
        const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.genericName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || med.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(medicines.map(m => m.category))];

    return (
        <TenantLayout title="Inventory" subtitle="Manage your pharmacy inventory">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search medicines..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                        />
                    </div>

                    {/* Filter */}
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        <ArrowDownTrayIcon className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">Export</span>
                    </button>
                    <Link href={`/${subdomain}/inventory/add`}>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-medi-green text-white rounded-xl hover:bg-medi-green/90 transition-colors shadow-lg shadow-medi-green/20">
                            <PlusIcon className="w-5 h-5" />
                            <span className="text-sm font-semibold">Add Medicine</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Items</p>
                            <p className="text-2xl font-bold text-slate-900">{medicines.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-medi-green/10 rounded-xl flex items-center justify-center">
                            <CubeIcon className="w-6 h-6 text-medi-green" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Low Stock</p>
                            <p className="text-2xl font-bold text-amber-600">{medicines.filter(m => m.quantity <= m.reorderLevel).length}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600">{medicines.filter(m => m.quantity === 0).length}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Categories</p>
                            <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FunnelIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Medicine</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry</th>
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
                            ) : filteredMedicines.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <CubeIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium">No medicines found</p>
                                        <p className="text-slate-400 text-sm">Add your first medicine to get started</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredMedicines.map((medicine) => (
                                    <tr key={medicine._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-slate-900">{medicine.name}</p>
                                                <p className="text-sm text-slate-500">{medicine.genericName || medicine.batchNumber}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                                {medicine.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-semibold ${medicine.quantity <= medicine.reorderLevel ? 'text-amber-600' : 'text-slate-900'}`}>
                                                {medicine.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">
                                            ${medicine.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(medicine.expiryDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {medicine.quantity === 0 ? (
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Out of Stock</span>
                                            ) : medicine.quantity <= medicine.reorderLevel ? (
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Low Stock</span>
                                            ) : (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">In Stock</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <PencilIcon className="w-4 h-4 text-slate-500" />
                                                </button>
                                                <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                                                    <TrashIcon className="w-4 h-4 text-red-500" />
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
