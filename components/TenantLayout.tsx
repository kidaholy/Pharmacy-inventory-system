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
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-slate-50'}`}>
            <div className="flex">
                {/* Left Sidebar */}
                <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'} border-r transition-all duration-300 flex flex-col shadow-lg min-h-screen fixed`}>
                    {/* Sidebar Header */}
                    <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-slate-100'}`}>
                        <div className="flex items-center justify-between">
                            {!sidebarCollapsed && (
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-medi-green rounded-xl flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-sm">MH</span>
                                    </div>
                                    <div className="ml-3">
                                        <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                            {tenantInfo ? tenantInfo.name : subdomain}
                                        </h1>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                            Pharmacy Dashboard
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
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-xl font-semibold transition-colors ${isActive(item.href)
                                    ? darkMode
                                        ? 'text-medi-lime bg-medi-green/20'
                                        : 'text-medi-green bg-medi-green/10'
                                    : darkMode
                                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {!sidebarCollapsed && <span className="ml-3">{item.name}</span>}
                            </Link>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    {!sidebarCollapsed && (
                        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-slate-100'}`}>
                            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-medi-green/5'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>Storage Used</span>
                                    <span className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-medi-green'}`}>68%</span>
                                </div>
                                <div className={`w-full bg-slate-200 rounded-full h-2 ${darkMode ? 'bg-gray-600' : ''}`}>
                                    <div className="bg-medi-green h-2 rounded-full" style={{ width: '68%' }}></div>
                                </div>
                                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                    2.1 GB of 3 GB used
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-16' : 'ml-72'} transition-all duration-300`}>
                    {/* Top Navigation Bar */}
                    <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'} border-b px-6 py-4 shadow-sm sticky top-0 z-40`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {title}
                                    </h1>
                                    {subtitle && (
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                {/* Search Bar */}
                                <div className="relative">
                                    <MagnifyingGlassIcon className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-slate-400'} absolute left-3 top-1/2 transform -translate-y-1/2`} />
                                    <input
                                        type="text"
                                        placeholder="Search anything..."
                                        className={`pl-10 pr-4 py-2.5 w-80 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green transition-colors`}
                                    />
                                </div>

                                {/* Dark Mode Toggle */}
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`p-2.5 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition-colors`}
                                >
                                    {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                                </button>

                                {/* Notifications */}
                                <button className={`relative p-2.5 rounded-xl ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-slate-600 hover:bg-slate-100'} transition-colors`}>
                                    <BellIcon className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* User Avatar Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                                        className={`flex items-center space-x-3 p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50'} transition-colors`}
                                    >
                                        <div className="w-10 h-10 bg-medi-green rounded-xl flex items-center justify-center shadow-lg">
                                            <span className="text-white text-sm font-bold">{user?.firstName?.[0]}</span>
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {user?.firstName} {user?.lastName}
                                            </p>
                                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'} capitalize`}>
                                                {user?.role}
                                            </p>
                                        </div>
                                        <ChevronDownIcon className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`} />
                                    </button>

                                    {showUserDropdown && (
                                        <div className={`absolute right-0 mt-2 w-56 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-100'} rounded-xl shadow-xl border py-2 z-50`}>
                                            <Link href={`/${subdomain}/settings`} className={`block px-4 py-3 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-slate-700 hover:bg-slate-50'} transition-colors`}>
                                                Profile Settings
                                            </Link>
                                            <hr className={`my-2 ${darkMode ? 'border-gray-700' : 'border-slate-100'}`} />
                                            <button
                                                onClick={handleLogout}
                                                className={`block w-full text-left px-4 py-3 text-sm ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'} transition-colors`}
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
