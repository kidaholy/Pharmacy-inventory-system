'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '../../../components/TenantLayout';
import {
    Download,
    BarChart3,
    ShoppingCart,
    Package,
    TrendingUp,
    TrendingDown,
    Calendar,
    DollarSign,
    Sparkles,
    LayoutDashboard,
    PieChart,
    ArrowUpRight
} from 'lucide-react';

export default function ReportsPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [dateRange, setDateRange] = useState('month');
    const [reportType, setReportType] = useState('sales');

    const reports = [
        {
            id: 'sales',
            name: 'Sales Analytics',
            description: 'Comprehensive breakdown of revenue and volume',
            icon: ShoppingCart,
            color: '#006840',
            stats: { value: '$12,450', change: '+15%', up: true }
        },
        {
            id: 'inventory',
            name: 'Inventory Valuation',
            description: 'Real-time stock value and movement audit',
            icon: Package,
            color: '#006840',
            stats: { value: '1,234', change: '+8%', up: true }
        },
        {
            id: 'purchases',
            name: 'Purchase Logs',
            description: 'Detailed procurement and supplier history',
            icon: LayoutDashboard,
            color: '#006840',
            stats: { value: '$8,920', change: '-3%', up: false }
        },
        {
            id: 'profit',
            name: 'Profit Analysis',
            description: 'Net profit margins and financial efficiency',
            icon: DollarSign,
            color: '#006840',
            stats: { value: '$3,530', change: '+22%', up: true }
        },
        {
            id: 'expiry',
            name: 'Expiry Tracking',
            description: 'Monitoring products approaching expiration',
            icon: Calendar,
            color: '#006840',
            stats: { value: '45', change: '-12%', up: true }
        },
        {
            id: 'trends',
            name: 'Sales Trends',
            description: 'Product performance and market velocity',
            icon: TrendingUp,
            color: '#006840',
            stats: { value: '156', change: '+18%', up: true }
        },
    ];

    return (
        <TenantLayout title="Analytics & Reports" subtitle="Monitor your pharmacy's performance and trends">
            {/* Filter Bar */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-6 mb-10 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Time Range:</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-medi-green text-xs font-black uppercase tracking-widest appearance-none cursor-pointer"
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

                    <button className="flex items-center gap-3 px-8 py-3.5 bg-medi-green text-white rounded-2xl hover:scale-[1.03] transition-all font-black shadow-lg">
                        <Download className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-black">Export Report</span>
                    </button>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reports.map((report) => (
                    <div
                        key={report.id}
                        className="bg-white rounded-[40px] border border-slate-100 hover:border-medi-green/20 transition-all cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-md"
                    >
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center group-hover:bg-medi-green/10 group-hover:border-medi-green/20 transition-all">
                                    <report.icon className="w-8 h-8" style={{ color: report.color }} />
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${report.stats.up ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                    {report.stats.up ? (
                                        <TrendingUp className="w-3.5 h-3.5" />
                                    ) : (
                                        <TrendingDown className="w-3.5 h-3.5" />
                                    )}
                                    {report.stats.change}
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-medi-green transition-colors">{report.name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-8 leading-relaxed">{report.description}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <span className="text-3xl font-black text-white italic">{report.stats.value}</span>
                                <button className="w-12 h-12 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-white/20 hover:text-[#F9E076] group-hover:scale-110 transition-all">
                                    <ArrowUpRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Summary */}
            <div className="mt-12 bg-slate-50 rounded-[40px] border border-slate-100 overflow-hidden p-10 relative">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <PieChart className="w-32 h-32 text-medi-green" />
                </div>

                <h3 className="text-xs font-black text-medi-green uppercase tracking-[0.4em] mb-10">Monthly Performance Summary</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    {[
                        { label: 'GROSS REVENUE', value: '$12,450', color: 'text-slate-900' },
                        { label: 'OPERATIONAL COST', value: '$8,920', color: 'text-slate-500' },
                        { label: 'NET PROFIT', value: '$3,530', color: 'text-medi-green' },
                        { label: 'PROFIT MARGIN', value: '28.4%', color: 'text-medi-green' }
                    ].map((item, i) => (
                        <div key={i} className="relative">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{item.label}</p>
                            <p className={`text-4xl font-black tracking-tighter ${item.color}`}>
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </TenantLayout>
    );
}
