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
    UsersIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Customer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    totalPurchases: number;
    lastVisit: string;
    createdAt: string;
}

export default function CustomersPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCustomers();
    }, [subdomain]);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            // Sample data for now
            setCustomers([
                { _id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', address: '123 Main St', totalPurchases: 1250.00, lastVisit: new Date().toISOString(), createdAt: new Date().toISOString() },
                { _id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321', address: '456 Oak Ave', totalPurchases: 890.50, lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
                { _id: '3', name: 'Robert Johnson', email: 'robert@example.com', phone: '+1122334455', address: '789 Pine Rd', totalPurchases: 2100.00, lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
            ]);
        } catch (error) {
            console.error('Failed to load customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <TenantLayout title="Customers" subtitle="Manage your customer database">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Customers</p>
                            <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-medi-green/10 rounded-xl flex items-center justify-center">
                            <UsersIcon className="w-6 h-6 text-medi-green" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Active This Month</p>
                            <p className="text-2xl font-bold text-blue-600">{customers.filter(c => new Date(c.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <UsersIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">New This Week</p>
                            <p className="text-2xl font-bold text-green-600">{customers.filter(c => new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <UsersIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-medi-green">${customers.reduce((sum, c) => sum + c.totalPurchases, 0).toFixed(2)}</p>
                        </div>
                        <div className="w-12 h-12 bg-medi-lime/20 rounded-xl flex items-center justify-center">
                            <UsersIcon className="w-6 h-6 text-medi-green" />
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
                        placeholder="Search customers..."
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
                    <Link href={`/${subdomain}/customers/add`}>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-medi-green text-white rounded-xl hover:bg-medi-green/90 transition-colors shadow-lg shadow-medi-green/20">
                            <PlusIcon className="w-5 h-5" />
                            <span className="text-sm font-semibold">Add Customer</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-medi-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No customers found</p>
                        <p className="text-slate-400 text-sm">Add your first customer to get started</p>
                    </div>
                ) : (
                    filteredCustomers.map((customer) => (
                        <div key={customer._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-medi-green/10 rounded-xl flex items-center justify-center">
                                        <span className="text-medi-green font-bold text-lg">{customer.name[0]}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{customer.name}</h3>
                                        <p className="text-sm text-slate-500">Customer since {new Date(customer.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <PencilIcon className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                                    <span>{customer.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                                    <span>{customer.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                                    <span>{customer.address}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-500">Total Purchases</p>
                                    <p className="font-bold text-medi-green">${customer.totalPurchases.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Last Visit</p>
                                    <p className="font-medium text-slate-700">{new Date(customer.lastVisit).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </TenantLayout>
    );
}
