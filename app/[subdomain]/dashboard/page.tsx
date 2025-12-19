'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  AlertTriangle, 
  ChevronRight, 
  Package, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  ShoppingCart, 
  Users, 
  Plus, 
  FileText, 
  RefreshCw, 
  Eye, 
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { User, auth } from '../../../lib/auth';
import ChartPlaceholder from '../../../components/ui/chart-placeholder';
import TenantLayout from '../../../components/TenantLayout';

interface TenantStats {
  totalMedicines: number;
  totalUsers: number;
  lowStockCount: number;
  expiringCount: number;
  pendingPrescriptions: number;
  totalInventoryValue: number;
}

interface TenantInfo {
  _id: string;
  name: string;
  subdomain: string;
  subscriptionPlan: string;
  contact: {
    email: string;
    phone?: string;
    city?: string;
    country?: string;
  };
}

export default function TenantDashboardPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const currentUser = auth.requireAuth();
    if (!currentUser) return;

    setUser(currentUser);
    loadDashboardData(currentUser);
  }, [subdomain]);

  const loadDashboardData = async (currentUser: User) => {
    try {
      setLoading(true);
      setError(null);

      if (currentUser.tenantSubdomain !== subdomain) {
        setError(`Access denied. You don't have permission to access ${subdomain} dashboard.`);
        setLoading(false);
        return;
      }

      const tenantResponse = await fetch(`/api/tenant/${subdomain}`);
      if (tenantResponse.ok) {
        const tenantData = await tenantResponse.json();
        setTenantInfo(tenantData);
      } else {
        setError('Failed to load pharmacy information');
      }

      const statsResponse = await fetch(`/api/tenant/${subdomain}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        setStats({
          totalMedicines: 0,
          totalUsers: 1,
          lowStockCount: 0,
          expiringCount: 0,
          pendingPrescriptions: 0,
          totalInventoryValue: 0
        });
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      setStats({
        totalMedicines: 0,
        totalUsers: 1,
        lowStockCount: 0,
        expiringCount: 0,
        pendingPrescriptions: 0,
        totalInventoryValue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantInfo) {
      document.title = `${tenantInfo.name} - Dashboard`;
    } else {
      document.title = `${subdomain} - Dashboard`;
    }
  }, [tenantInfo, subdomain]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      auth.logout();
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-medi-green rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl animate-pulse">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-medi-green rounded-3xl animate-ping opacity-10 mx-auto"></div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Initializing Systems</h3>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Syncing {subdomain} operations...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-12 rounded-[40px] shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Access Forbidden</h3>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">{error}</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-10 py-5 bg-medi-green text-white rounded-full font-bold hover:scale-105 transition-all shadow-xl shadow-medi-green/20">
            Return to Login
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <TenantLayout title="Command Center" subtitle={`SYSTEM ACTIVE FOR ${user?.firstName}`}>
      <main className="space-y-12 pb-12">
        {/* Mission Critical Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Total Inventory', value: stats?.totalMedicines || 0, icon: Package, color: '#006840', trend: '+12%', sub: 'Product Catalog' },
            { label: 'Stock Alerts', value: stats?.lowStockCount || 0, icon: AlertTriangle, color: '#EF4444', trend: 'Critical', sub: 'Low stock detected', accent: true },
            { label: 'Gross Volume', value: '$2,847', icon: TrendingUp, color: '#006840', trend: '+8.4%', sub: 'Daily Sales Flow' },
            { label: 'Asset Value', value: `$${(stats?.totalInventoryValue || 0).toLocaleString()}`, icon: DollarSign, color: '#006840', trend: '+15%', sub: 'Global Inventory Value' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 transition-all duration-500 hover:shadow-xl group cursor-default relative overflow-hidden">
              {stat.accent && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>}
              <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-medi-green transition-colors duration-500">
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.accent ? 'bg-red-50 text-red-500' : 'bg-medi-green/10 text-medi-green'}`}>
                  {stat.trend}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</h4>
                <p className="text-4xl font-black tracking-tighter mb-4 text-slate-900">
                  {stat.value}
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-medi-green/40" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{stat.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Core Operational Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sales Intelligence */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                  Revenue <span className="text-medi-green">Insights.</span>
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time financial performance analytics</p>
              </div>
              <div className="flex gap-2 p-1 rounded-2xl bg-slate-50 border border-slate-100">
                {['7D', '30D', '90D'].map((d, i) => (
                  <button key={i} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${i === 1 ? 'bg-medi-lime text-slate-900 shadow-sm' : 'text-slate-400 hover:text-medi-green'
                    }`}>{d}</button>
                ))}
              </div>
            </div>
            <div className="h-[400px]">
              <ChartPlaceholder
                title="Sales Flow Grid"
                type="line"
                darkMode={false}
              />
            </div>
          </div>

          {/* Performance Rankings */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-10 uppercase">
              Top <span className="text-medi-green">Products.</span>
            </h3>
            <div className="space-y-8">
              {[
                { id: 1, name: 'Paracetamol 500mg', sold: '245 units', val: '$1,225', icon: '💊' },
                { id: 2, name: 'Ibuprofen 400mg', sold: '189 units', val: '$945', icon: '🧪' },
                { id: 3, name: 'Vitamin C 1000mg', sold: '156 units', val: '$780', icon: '🍊' },
                { id: 4, name: 'Amoxicillin 250mg', sold: '124 units', val: '$620', icon: '🧬' }
              ].map((item) => (
                <div key={item.id} className="flex items-center group cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-all group-hover:border-medi-green/30">
                    {item.icon}
                  </div>
                  <div className="ml-6 flex-1">
                    <p className="font-black text-lg leading-tight mb-1 text-slate-900 tracking-tight">{item.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.sold} distributed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-medi-green">{item.val}</p>
                    <div className="flex items-center gap-1 justify-end">
                      <TrendingUp className="w-3 h-3 text-medi-green/50" />
                      <span className="text-[10px] font-black text-medi-green/50 uppercase tracking-widest">Peak</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-5 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-400 mt-12 hover:text-medi-green hover:bg-slate-100 transition-all uppercase tracking-[0.2em] text-[10px]">
              Full Inventory Intelligence
            </button>
          </div>
        </div>

        {/* Tactical Feed & Quick Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Live Operation Feed */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Live <span className="text-medi-green">Operations.</span></h3>
              <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-medi-green transition-colors">Digital Audit</button>
            </div>
            <div className="space-y-6">
              {[
                { type: 'sale', title: 'Transaction Successful', desc: 'Paracetamol 500mg • Order #4492', val: '+$25.50', time: '2m ago', icon: ShoppingCart, color: '#006840' },
                { type: 'stock', title: 'Supply Nodes Updated', desc: 'Ibuprofen 400mg restocked into Section A', val: '+50 units', time: '15m ago', icon: Package, color: '#006840' },
                { type: 'alert', title: 'Stability Warning', desc: 'Vitamin D expires in < 30 cycles', val: 'Action Req.', time: '1h ago', icon: AlertTriangle, color: '#EF4444' },
                { type: 'user', title: 'New Actor Registered', desc: 'Pharmacist John Smith integrated into system', val: 'Verified', time: '2h ago', icon: Users, color: '#006840' }
              ].map((ev, i) => (
                <div key={i} className="flex items-center p-6 rounded-[32px] bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mr-6 border border-slate-100 group-hover:border-medi-green/30 transition-colors shadow-sm">
                    <ev.icon className="w-6 h-6" style={{ color: ev.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-lg mb-0.5 truncate text-slate-900 tracking-tight">{ev.title}</p>
                    <p className="text-xs font-bold text-slate-400 truncate uppercase tracking-widest">{ev.desc}</p>
                  </div>
                  <div className="text-right ml-6">
                    <p className="font-black text-lg" style={{ color: ev.color }}>{ev.val}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-300">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instant Action Matrix */}
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-10 uppercase">Quick <span className="text-medi-green">Actions.</span></h3>
            <div className="flex flex-col gap-4 flex-1">
              {[
                { label: 'Register Sale', icon: ShoppingCart, href: `/${subdomain}/sales/new`, primary: true },
                { label: 'Add Medicine', icon: Plus, href: `/${subdomain}/inventory/add` },
                { label: 'Generate Reports', icon: FileText, href: `/${subdomain}/reports` },
                { label: 'System Settings', icon: Cog6ToothIcon, href: `/${subdomain}/settings` }
              ].map((act, i) => (
                <Link key={i} href={act.href} className="w-full">
                  <button className={`w-full flex items-center gap-5 px-8 py-6 rounded-[32px] font-black text-lg transition-all group border ${act.primary
                    ? 'bg-medi-green text-white border-transparent shadow-lg hover:scale-[1.03]'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-medi-green hover:bg-slate-100 hover:border-medi-green/20'
                    }`}>
                    <div className={`p-2.5 rounded-xl transition-all ${act.primary ? 'bg-white/10' : 'bg-white shadow-sm group-hover:bg-medi-green/10'}`}>
                      <act.icon className="w-6 h-6" />
                    </div>
                    {act.label}
                    <ArrowUpRight className={`ml-auto w-5 h-5 transition-all ${act.primary ? 'text-white' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4'}`} />
                  </button>
                </Link>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-slate-100 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-medi-green" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Engine</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-medi-lime/20 text-medi-green text-[10px] font-black">v2.4.0-CORE</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stability</p>
                  <p className="text-xl font-black text-medi-green">99.9%</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Latency</p>
                  <p className="text-xl font-black text-medi-green">14ms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </TenantLayout>
  );
}
