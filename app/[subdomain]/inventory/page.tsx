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
    manufacturer?: string;
    supplier?: string;
    batchNumber?: string;
    // New nested structure
    stock?: {
        current: number;
        minimum: number;
        available: number;
    };
    pricing?: {
        sellingPrice: number;
        costPrice: number;
        mrp: number;
    };
    dates?: {
        expiryDate: string;
    };
    // Legacy flat structure
    price?: number;
    quantity?: number;
    expiryDate?: string;
    reorderLevel?: number;
}

export default function InventoryPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Helper functions to handle both old and new medicine structures
    const getPrice = (medicine: Medicine): number => {
        return medicine.pricing?.sellingPrice ?? medicine.price ?? 0;
    };

    const getQuantity = (medicine: Medicine): number => {
        return medicine.stock?.current ?? medicine.quantity ?? 0;
    };

    const getReorderLevel = (medicine: Medicine): number => {
        return medicine.stock?.minimum ?? medicine.reorderLevel ?? 10;
    };

    const getExpiryDate = (medicine: Medicine): string => {
        return medicine.dates?.expiryDate ?? medicine.expiryDate ?? '';
    };

    const getBatchNumber = (medicine: Medicine): string => {
        return medicine.batchNumber ?? 'N/A';
    };

    const handleDeleteMedicine = async (medicineId: string, medicineName: string) => {
        if (!confirm(`Are you sure you want to delete "${medicineName}"? This will immediately remove it from MongoDB Atlas.`)) {
            return;
        }

        try {
            setLoading(true);
            
            // Optimistically remove from UI for immediate response
            const originalMedicines = [...medicines];
            setMedicines(prevMedicines => 
                prevMedicines.filter(med => med._id !== medicineId)
            );
            
            const response = await fetch(`/api/tenant/${subdomain}/medicines/${medicineId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                // Revert optimistic update on failure
                setMedicines(originalMedicines);
                alert(data.error || 'Failed to delete medicine');
            }
        } catch (error) {
            // Revert optimistic update on error
            setMedicines(medicines);
            alert('Failed to delete medicine');
        } finally {
            setLoading(false);
        }
    };

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
            <div className="flex flex-col gap-4 mb-8 lg:mb-10">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1 group">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-medi-green transition-colors" />
                        <input
                            type="text"
                            placeholder="Find medicine..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3 lg:py-4 bg-white border border-slate-200 rounded-xl lg:rounded-2xl focus:outline-none focus:border-medi-green/30 text-slate-900 placeholder:text-slate-400 font-bold transition-all shadow-sm text-sm lg:text-base"
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative group">
                        <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full sm:w-auto pl-10 pr-10 py-3 lg:py-4 bg-white border border-slate-200 rounded-xl lg:rounded-2xl focus:outline-none focus:border-medi-green/30 text-slate-600 font-bold appearance-none cursor-pointer shadow-sm text-sm lg:text-base"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button className="flex items-center justify-center gap-3 px-4 lg:px-6 py-3 lg:py-4 bg-white border border-slate-200 rounded-xl lg:rounded-2xl hover:bg-slate-50 transition-all text-slate-500 font-black uppercase tracking-widest text-[10px] shadow-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <Link href={`/${subdomain}/inventory/add`} className="flex-1 sm:flex-none">
                        <button className="w-full flex items-center justify-center gap-3 px-6 lg:px-8 py-3 lg:py-4 bg-medi-green text-white rounded-xl lg:rounded-2xl hover:scale-[1.03] transition-all font-black shadow-lg text-sm lg:text-base">
                            <Plus className="w-5 h-5" />
                            Add Medicine
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
                {[
                    { label: 'Total Products', value: medicines.length, icon: Package, color: '#006840', sub: 'Indexed volume' },
                    { label: 'Low Stock', value: medicines.filter(m => getQuantity(m) <= getReorderLevel(m)).length, icon: AlertTriangle, color: '#EF4444', sub: 'Requires attention' },
                    { label: 'Out of Stock', value: medicines.filter(m => getQuantity(m) === 0).length, icon: Activity, color: '#F97316', sub: 'Critical' },
                    { label: 'Categories', value: categories.length, icon: Filter, color: '#006840', sub: 'Active sectors' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-3 lg:mb-4">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl flex items-center justify-center">
                                <stat.icon className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: stat.color }} />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <p className="text-2xl lg:text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{stat.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-4 mb-8">
                {loading ? (
                    <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-medi-green rounded-full p-0.5 animate-spin">
                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-medi-green" />
                                </div>
                            </div>
                            <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Inventory...</p>
                        </div>
                    </div>
                ) : filteredMedicines.length === 0 ? (
                    <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm">
                        <div className="text-center opacity-40">
                            <Package className="w-16 h-16 text-slate-400 mx-auto mb-6" />
                            <p className="font-black text-slate-900 text-lg uppercase tracking-widest">Inventory Empty</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">No products found in this category</p>
                        </div>
                    </div>
                ) : (
                    filteredMedicines.map((medicine) => {
                        const price = getPrice(medicine);
                        const quantity = getQuantity(medicine);
                        const reorderLevel = getReorderLevel(medicine);
                        const expiryDate = getExpiryDate(medicine);
                        const batchNumber = getBatchNumber(medicine);
                        
                        return (
                        <div key={medicine._id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Package className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-black text-slate-900 tracking-tight text-lg mb-1 truncate">{medicine.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{medicine.genericName || batchNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button 
                                        className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-medi-green hover:bg-slate-100 transition-all shadow-sm"
                                        title="Edit Medicine"
                                        onClick={() => {
                                            window.location.href = `/${subdomain}/inventory/edit/${medicine._id}`;
                                        }}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                        className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                                        title="Delete Medicine"
                                        onClick={() => handleDeleteMedicine(medicine._id, medicine.name)}
                                        disabled={loading}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                                    <span className="px-3 py-1 bg-medi-lime/20 text-medi-green text-[10px] font-black uppercase tracking-widest rounded-full">
                                        {medicine.category}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</p>
                                    <p className="font-black text-medi-green text-lg">${price.toFixed(2)}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-lg font-black ${quantity <= reorderLevel ? 'text-red-500' : 'text-slate-900'}`}>
                                            {quantity}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-300 uppercase">units</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expires</p>
                                    <p className="text-slate-500 font-medium text-sm">
                                        {expiryDate ? new Date(expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-100">
                                {quantity === 0 ? (
                                    <span className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        Out of Stock
                                    </span>
                                ) : quantity <= reorderLevel ? (
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
                            </div>
                        </div>
                        )
                    })
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
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
                                filteredMedicines.map((medicine) => {
                                    const price = getPrice(medicine);
                                    const quantity = getQuantity(medicine);
                                    const reorderLevel = getReorderLevel(medicine);
                                    const expiryDate = getExpiryDate(medicine);
                                    const batchNumber = getBatchNumber(medicine);
                                    
                                    return (
                                    <tr key={medicine._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:border-medi-green/30 transition-colors">
                                                    <Package className="w-6 h-6 text-slate-300 group-hover:text-medi-green/50" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 tracking-tight text-lg mb-0.5">{medicine.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-[0.1em]">{medicine.genericName || batchNumber}</p>
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
                                                <span className={`text-xl font-black ${quantity <= reorderLevel ? 'text-red-500' : 'text-slate-900'}`}>
                                                    {quantity}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-300 uppercase">units</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-black text-medi-green text-xl">
                                            ${price.toFixed(2)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-slate-500 font-medium text-sm">
                                                {expiryDate ? new Date(expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            {quantity === 0 ? (
                                                <span className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                    Out of Stock
                                                </span>
                                            ) : quantity <= reorderLevel ? (
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
                                                <button 
                                                    className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-medi-green hover:bg-slate-100 transition-all shadow-sm"
                                                    title="Edit Medicine"
                                                    onClick={() => {
                                                        // Navigate to edit page or open edit modal
                                                        window.location.href = `/${subdomain}/inventory/edit/${medicine._id}`;
                                                    }}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                                                    title="Delete Medicine"
                                                    onClick={() => handleDeleteMedicine(medicine._id, medicine.name)}
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </TenantLayout>
    );
}
