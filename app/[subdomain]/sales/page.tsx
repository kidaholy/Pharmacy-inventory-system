'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '../../../components/TenantLayout';
import {
    Plus,
    Search,
    Download,
    Eye,
    Printer,
    ShoppingCart,
    DollarSign,
    Calendar,
    BarChart3,
    ArrowUpRight,
    Sparkles,
    CheckCircle2,
    Clock
} from 'lucide-react';
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
        <TenantLayout title="Sales Overview" subtitle="Track and manage your pharmacy transactions">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: "Today's Revenue", value: `$${todayTotal.toFixed(2)}`, icon: DollarSign, color: '#006840', sub: 'Gross Revenue' },
                    { label: "Total Sales", value: sales.length, icon: ShoppingCart, color: '#006840', sub: 'Transactions' },
                    { label: "Items Sold", value: sales.reduce((sum, s) => sum + s.items, 0), icon: BarChart3, color: '#006840', sub: 'Inventory Flow' },
                    { label: "Avg. Sale", value: `$${sales.length ? (todayTotal / sales.length).toFixed(2) : '0.00'}`, icon: Clock, color: '#006840', sub: 'Performance' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
                                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Update</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{stat.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-medi-green transition-colors" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-medi-green/30 text-slate-900 placeholder:text-slate-400 font-bold transition-all shadow-sm"
                        />
                    </div>

                    <div className="relative group">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="pl-10 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-medi-green/30 text-slate-600 font-bold appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-500 font-black uppercase tracking-widest text-[10px] shadow-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <Link href={`/${subdomain}/sales/new`}>
                        <button className="flex items-center gap-3 px-8 py-4 bg-medi-green text-white rounded-2xl hover:scale-[1.03] transition-all font-black shadow-lg">
                            <Plus className="w-5 h-5" />
                            New Sale
                        </button>
                    </Link>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Invoice Number</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Customer</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Items</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Value</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Payment</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Date</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
                                <th className="text-right px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-medi-green rounded-full p-0.5 animate-spin">
                                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                                    <Sparkles className="w-5 h-5 text-medi-green" />
                                                </div>
                                            </div>
                                            <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading Sales Data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-8 py-20 text-center">
                                        <div className="max-w-xs mx-auto opacity-40">
                                            <ShoppingCart className="w-16 h-16 text-slate-400 mx-auto mb-6" />
                                            <p className="font-black text-slate-900 text-lg uppercase tracking-widest">No Sales Found</p>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">No transactions recorded in this period</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="font-black text-medi-green tracking-wider">{sale.invoiceNumber}</span>
                                        </td>
                                        <td className="px-8 py-6 text-slate-700 font-bold">{sale.customer}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-900 font-black">{sale.items}</span>
                                                <span className="text-[10px] font-bold text-slate-300 uppercase">units</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-medi-green font-black text-xl italic">${sale.total.toFixed(2)}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 bg-medi-lime/20 text-[10px] font-black uppercase tracking-widest rounded-full ${sale.paymentMethod === 'Cash' ? 'text-emerald-600' : 'text-blue-600'
                                                }`}>
                                                {sale.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-slate-400 font-medium text-sm">
                                            {new Date(sale.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Completed
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-medi-green hover:bg-slate-100 transition-all shadow-sm">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-medi-green hover:bg-slate-100 transition-all shadow-sm">
                                                    <Printer className="w-4 h-4" />
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
