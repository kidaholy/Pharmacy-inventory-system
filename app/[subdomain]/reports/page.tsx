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
            <div className="bg-white rounded-[24px] lg:rounded-[32px] border border-slate-100 p-4 lg:p-6 mb-8 lg:mb-10 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Time Range:</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 lg:px-6 py-2 lg:py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-medi-green text-xs font-black uppercase tracking-widest appearance-none cursor-pointer"
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

                    <button className="flex items-center justify-center gap-3 px-6 lg:px-8 py-3 lg:py-3.5 bg-medi-green text-white rounded-xl lg:rounded-2xl hover:scale-[1.03] transition-all font-black shadow-lg">
                        <Download className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-black">Export Report</span>
                    </button>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {reports.map((report) => (
                    <div
                        key={report.id}
                        className="bg-white rounded-[24px] lg:rounded-[40px] border border-slate-100 hover:border-medi-green/20 transition-all cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-md"
                    >
                        <div className="p-6 lg:p-8">
                            <div className="flex items-start justify-between mb-6 lg:mb-8">
                                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-slate-50 border border-slate-100 rounded-2xl lg:rounded-3xl flex items-center justify-center group-hover:bg-medi-green/10 group-hover:border-medi-green/20 transition-all">
                                    <report.icon className="w-6 h-6 lg:w-8 lg:h-8" style={{ color: report.color }} />
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${report.stats.up ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                    {report.stats.up ? (
                                        <TrendingUp className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                                    )}
                                    {report.stats.change}
                                </div>
                            </div>

                            <h3 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-medi-green transition-colors">{report.name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-6 lg:mb-8 leading-relaxed">{report.description}</p>

                            <div className="flex items-center justify-between pt-4 lg:pt-6 border-t border-slate-100">
                                <span className="text-2xl lg:text-3xl font-black text-slate-900 italic">{report.stats.value}</span>
                                <button className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl flex items-center justify-center text-slate-400 hover:text-medi-green group-hover:scale-110 transition-all">
                                    <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Summary */}
            <div className="mt-8 lg:mt-12 bg-slate-50 rounded-[24px] lg:rounded-[40px] border border-slate-100 overflow-hidden p-6 lg:p-10 relative">
                <div className="absolute top-0 right-0 p-6 lg:p-10 opacity-5 pointer-events-none">
                    <PieChart className="w-20 h-20 lg:w-32 lg:h-32 text-medi-green" />
                </div>

                <h3 className="text-xs font-black text-medi-green uppercase tracking-[0.4em] mb-6 lg:mb-10">Monthly Performance Summary</h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
                    {[
                        { label: 'GROSS REVENUE', value: '$12,450', color: 'text-slate-900' },
                        { label: 'OPERATIONAL COST', value: '$8,920', color: 'text-slate-500' },
                        { label: 'NET PROFIT', value: '$3,530', color: 'text-medi-green' },
                        { label: 'PROFIT MARGIN', value: '28.4%', color: 'text-medi-green' }
                    ].map((item, i) => (
                        <div key={i} className="relative">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 lg:mb-3">{item.label}</p>
                            <p className={`text-2xl lg:text-4xl font-black tracking-tighter ${item.color}`}>
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </TenantLayout>
    );
}
