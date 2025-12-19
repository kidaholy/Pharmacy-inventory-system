'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '../../../components/TenantLayout';
import {
    Plus,
    Search,
    Filter,
    Download,
    Pencil,
    Trash2,
    AlertTriangle,
    Package,
    Activity,
    ChevronRight,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
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
        <TenantLayout title="Inventory Management" subtitle="Monitor and manage pharmaceutical stock">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                <div className="flex items-center gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md group">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-medi-green transition-colors" />
                        <input
                            type="text"
                            placeholder="Find medicine..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-medi-green/30 text-slate-900 placeholder:text-slate-400 font-bold transition-all shadow-sm"
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative group">
                        <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="pl-10 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-medi-green/30 text-slate-600 font-bold appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-500 font-black uppercase tracking-widest text-[10px] shadow-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <Link href={`/${subdomain}/inventory/add`}>
                        <button className="flex items-center gap-3 px-8 py-4 bg-medi-green text-white rounded-2xl hover:scale-[1.03] transition-all font-black shadow-lg">
                            <Plus className="w-5 h-5" />
                            Add Medicine
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Products', value: medicines.length, icon: Package, color: '#006840', sub: 'Indexed volume' },
                    { label: 'Low Stock', value: medicines.filter(m => m.quantity <= m.reorderLevel).length, icon: AlertTriangle, color: '#EF4444', sub: 'Requires attention' },
                    { label: 'Out of Stock', value: medicines.filter(m => m.quantity === 0).length, icon: Activity, color: '#F97316', sub: 'Critical' },
                    { label: 'Categories', value: categories.length, icon: Filter, color: '#006840', sub: 'Active sectors' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
                                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{stat.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Medicine Name</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Category</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Stock Level</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Unit Price</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Expiration</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
                                <th className="text-right px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-medi-green rounded-full p-0.5 animate-spin">
                                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                                    <Sparkles className="w-5 h-5 text-medi-green" />
                                                </div>
                                            </div>
                                            <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Inventory...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMedicines.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center">
                                        <div className="max-w-xs mx-auto opacity-40">
                                            <Package className="w-16 h-16 text-slate-400 mx-auto mb-6" />
                                            <p className="font-black text-slate-900 text-lg uppercase tracking-widest">Inventory Empty</p>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">No products found in this category</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredMedicines.map((medicine) => (
                                    <tr key={medicine._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:border-medi-green/30 transition-colors">
                                                    <Package className="w-6 h-6 text-slate-300 group-hover:text-medi-green/50" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 tracking-tight text-lg mb-0.5">{medicine.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-[0.1em]">{medicine.genericName || medicine.batchNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-4 py-1.5 bg-medi-lime/20 text-medi-green text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded-full">
                                                {medicine.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xl font-black ${medicine.quantity <= medicine.reorderLevel ? 'text-red-500' : 'text-slate-900'}`}>
                                                    {medicine.quantity}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-300 uppercase">units</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-black text-medi-green text-xl">
                                            ${medicine.price.toFixed(2)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-slate-500 font-medium text-sm">
                                                {new Date(medicine.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            {medicine.quantity === 0 ? (
                                                <span className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                    Out of Stock
                                                </span>
                                            ) : medicine.quantity <= medicine.reorderLevel ? (
                                                <span className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-medi-green text-[10px] font-black uppercase tracking-widest">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-medi-green opacity-50" />
                                                    Available
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-medi-green hover:bg-slate-100 transition-all shadow-sm">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                                                    <Trash2 className="w-4 h-4" />
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
