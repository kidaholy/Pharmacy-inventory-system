'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '../../../components/TenantLayout';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    PencilIcon,
    BuildingStorefrontIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Supplier {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    category: string;
    rating: number;
    totalOrders: number;
    status: 'active' | 'inactive';
}

export default function SuppliersPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSuppliers();
    }, [subdomain]);

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            // Sample data for now
            setSuppliers([
                { _id: '1', name: 'MedSupply Co.', email: 'contact@medsupply.com', phone: '+1234567890', address: '100 Pharma Blvd', category: 'General', rating: 5, totalOrders: 45, status: 'active' },
                { _id: '2', name: 'PharmaCorp', email: 'sales@pharmacorp.com', phone: '+0987654321', address: '200 Health St', category: 'Specialty', rating: 4, totalOrders: 32, status: 'active' },
                { _id: '3', name: 'HealthDist Ltd', email: 'info@healthdist.com', phone: '+1122334455', address: '300 Medical Ave', category: 'OTC', rating: 4, totalOrders: 28, status: 'active' },
                { _id: '4', name: 'BioMed Supplies', email: 'orders@biomed.com', phone: '+5544332211', address: '400 Lab Rd', category: 'Laboratory', rating: 3, totalOrders: 15, status: 'inactive' },
            ]);
        } catch (error) {
            console.error('Failed to load suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            i < rating
                ? <StarSolidIcon key={i} className="w-4 h-4 text-amber-400" />
                : <StarIcon key={i} className="w-4 h-4 text-slate-300" />
        ));
    };

    return (
        <TenantLayout title="Suppliers" subtitle="Manage your supplier network">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Suppliers</p>
                            <p className="text-2xl font-bold text-slate-900">{suppliers.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-medi-green/10 rounded-xl flex items-center justify-center">
                            <BuildingStorefrontIcon className="w-6 h-6 text-medi-green" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Active</p>
                            <p className="text-2xl font-bold text-green-600">{suppliers.filter(s => s.status === 'active').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <BuildingStorefrontIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Inactive</p>
                            <p className="text-2xl font-bold text-slate-400">{suppliers.filter(s => s.status === 'inactive').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                            <BuildingStorefrontIcon className="w-6 h-6 text-slate-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Orders</p>
                            <p className="text-2xl font-bold text-blue-600">{suppliers.reduce((sum, s) => sum + s.totalOrders, 0)}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <BuildingStorefrontIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        <ArrowDownTrayIcon className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">Export</span>
                    </button>
                    <Link href={`/${subdomain}/suppliers/add`}>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-medi-green text-white rounded-xl hover:bg-medi-green/90 transition-colors shadow-lg shadow-medi-green/20">
                            <PlusIcon className="w-5 h-5" />
                            <span className="text-sm font-semibold">Add Supplier</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-medi-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <BuildingStorefrontIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No suppliers found</p>
                        <p className="text-slate-400 text-sm">Add your first supplier to get started</p>
                    </div>
                ) : (
                    filteredSuppliers.map((supplier) => (
                        <div key={supplier._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-medi-green/10 rounded-xl flex items-center justify-center">
                                        <BuildingStorefrontIcon className="w-6 h-6 text-medi-green" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{supplier.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${supplier.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {supplier.status}
                                        </span>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <PencilIcon className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>

                            <div className="flex items-center gap-1 mb-3">
                                {renderStars(supplier.rating)}
                                <span className="text-sm text-slate-500 ml-1">({supplier.totalOrders} orders)</span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                                    <span>{supplier.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                                    <span>{supplier.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                                    <span>{supplier.address}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                                    {supplier.category}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </TenantLayout>
    );
}
