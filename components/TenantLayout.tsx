'use client';

import { useState, useEffect, ReactNode } from 'react';
import { auth, User } from '../lib/auth';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    ChartBarIcon,
    CubeIcon,
    ShoppingCartIcon,
    TruckIcon,
    UsersIcon,
    BuildingStorefrontIcon,
    DocumentChartBarIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon,
    BellIcon,
    ChevronLeftIcon,
    SunIcon,
    MoonIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';

interface TenantInfo {
    _id: string;
    name: string;
    subdomain: string;
    subscriptionPlan: string;
    settings?: {
        branding?: {
            logo?: string;
        }
    }
}

interface TenantLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export default function TenantLayout({ children, title, subtitle }: TenantLayoutProps) {
    const params = useParams();
    const pathname = usePathname();
    const subdomain = params.subdomain as string;

    const [user, setUser] = useState<User | null>(null);
    const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const currentUser = auth.requireAuth();
        if (currentUser) {
            setUser(currentUser);
            loadTenantInfo();
        }
    }, [subdomain]);

    const loadTenantInfo = async () => {
        try {
            const response = await fetch(`/api/tenant/${subdomain}`);
            if (response.ok) {
                const data = await response.json();
                setTenantInfo(data);
            }
        } catch (error) {
            console.error('Failed to load tenant info:', error);
        }
    };

    const handleLogout = () => {
        auth.logout();
    };

    const navItems = [
        { name: 'Dashboard', href: `/${subdomain}/dashboard`, icon: ChartBarIcon },
        { name: 'Inventory', href: `/${subdomain}/inventory`, icon: CubeIcon },
        { name: 'Sales', href: `/${subdomain}/sales`, icon: ShoppingCartIcon },
        { name: 'Purchases', href: `/${subdomain}/purchases`, icon: TruckIcon },
        { name: 'Customers', href: `/${subdomain}/customers`, icon: UsersIcon },
        { name: 'Suppliers', href: `/${subdomain}/suppliers`, icon: BuildingStorefrontIcon },
        { name: 'Reports', href: `/${subdomain}/reports`, icon: DocumentChartBarIcon },
        { name: 'Settings', href: `/${subdomain}/settings`, icon: Cog6ToothIcon },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-medi-green selection:text-white">
            <div className="flex">
                {/* Left Sidebar */}
                <div className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-medi-green transition-all duration-500 flex flex-col shadow-xl min-h-screen fixed z-[60]`}>
                    {/* Sidebar Header */}
                    <div className="p-8 border-b border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-[60px] rounded-full -mr-16 -mt-16"></div>
                        <div className="flex items-center justify-between">
                            {!sidebarCollapsed && (
                                <div className="flex items-center">
                                    {tenantInfo?.settings?.branding?.logo ? (
                                        <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-lg transition-transform duration-500">
                                            <img src={tenantInfo.settings.branding.logo} alt={tenantInfo.name} className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg transition-transform duration-500">
                                            <span className="text-medi-green font-black text-lg">
                                                {tenantInfo ? tenantInfo.name[0].toUpperCase() : subdomain[0].toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="ml-4">
                                        <h1 className="text-xl font-black text-white tracking-tight">
                                            {tenantInfo ? tenantInfo.name : subdomain}
                                        </h1>
                                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">
                                            Pharmacy Node
                                        </p>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-slate-100 text-slate-500'} transition-colors`}
                            >
                                <ChevronLeftIcon className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 p-4 space-y-1 mt-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-5 py-3 rounded-xl font-bold transition-all duration-300 group ${isActive(item.href)
                                    ? 'text-medi-green bg-white shadow-md'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 transition-colors ${isActive(item.href) ? 'text-medi-green' : 'group-hover:text-white'}`} />
                                {!sidebarCollapsed && (
                                    <div className="flex items-center justify-between flex-1 ml-4">
                                        <span className="tracking-tight">{item.name}</span>
                                        {isActive(item.href) && <div className="w-1.5 h-1.5 rounded-full bg-medi-lime shadow-[0_0_8px_rgba(212,240,93,0.6)]"></div>}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    {!sidebarCollapsed && (
                        <div className="p-6 border-t border-white/10">
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Inventory Load</span>
                                    <span className="text-[10px] font-black text-white">68%</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-medi-lime h-full rounded-full" style={{ width: '68%' }}></div>
                                </div>
                                <p className="text-[10px] mt-3 text-white/30 font-medium">
                                    Professional Tier Active
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-20' : 'ml-72'} transition-all duration-500`}>
                    {/* Top Navigation Bar */}
                    <header className="px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
                                        {title}
                                    </h1>
                                    {subtitle && (
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-6">
                                {/* Search Bar */}
                                <div className="relative group">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors group-hover:text-medi-green" />
                                    <input
                                        type="text"
                                        placeholder="Search inventory, sales, users..."
                                        className="pl-12 pr-6 py-3 w-96 bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-medi-green/10 focus:border-medi-green/30 transition-all font-bold text-sm"
                                    />
                                </div>

                                {/* Notifications */}
                                <button className="relative p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-medi-green transition-all hover:scale-110 active:scale-95">
                                    <BellIcon className="w-5 h-5" />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-medi-lime rounded-full shadow-sm"></span>
                                </button>

                                {/* User Avatar Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                                        className="flex items-center space-x-4 p-2 rounded-2xl hover:bg-slate-50 transition-all group"
                                    >
                                        <div className="w-11 h-11 bg-medi-green rounded-xl flex items-center justify-center shadow-lg overflow-hidden transform group-hover:rotate-12 transition-transform">
                                            {user?.image ? (
                                                <img src={user.image} alt={user.firstName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white text-sm font-black italic">{user?.firstName?.[0]}</span>
                                            )}
                                        </div>
                                        <div className="text-left hidden md:block">
                                            <p className="text-sm font-black text-slate-900 tracking-tight">
                                                {user?.firstName} {user?.lastName}
                                            </p>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-medi-green">
                                                {user?.role}
                                            </p>
                                        </div>
                                        <ChevronDownIcon className="w-4 h-4 text-slate-300" />
                                    </button>

                                    {showUserDropdown && (
                                        <div className="absolute right-0 mt-4 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 z-[100] animate-in fade-in zoom-in duration-200">
                                            <Link href={`/${subdomain}/settings`} className="block px-5 py-4 text-sm font-bold text-slate-600 hover:text-medi-green hover:bg-slate-50 transition-all">
                                                Settings
                                            </Link>
                                            <div className="mx-5 my-2 border-t border-slate-100"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-5 py-4 text-sm font-black text-red-400 hover:bg-red-500/10 transition-all uppercase tracking-widest text-xs"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
