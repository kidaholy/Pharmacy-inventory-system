'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../../lib/auth';
import {
    EyeIcon,
    EyeSlashIcon,
    ArrowRightIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface TenantInfo {
    _id: string;
    name: string;
    subdomain: string;
}

export default function TenantLoginPage() {
    const params = useParams();
    const router = useRouter();
    const subdomain = params.subdomain as string;

    const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if already logged in
        const currentUser = auth.getCurrentUser();
        if (currentUser && currentUser.tenantSubdomain === subdomain) {
            router.push(`/${subdomain}/dashboard`);
            return;
        }

        loadTenantInfo();
    }, [subdomain, router]);

    const loadTenantInfo = async () => {
        try {
            const response = await fetch(`/api/tenant/${subdomain}`);
            if (response.ok) {
                const data = await response.json();
                setTenantInfo(data);
            }
        } catch (err) {
            console.error('Failed to load tenant info:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await auth.login(email, password);

            if (!result.success || !result.user) {
                throw new Error(result.error || 'Login failed');
            }

            // Verify user belongs to this tenant
            if (result.user.role !== 'super_admin' && result.user.tenantSubdomain !== subdomain) {
                auth.logout(); // Clear the session if it's the wrong tenant
                throw new Error(`This account belongs to a different pharmacy`);
            }

            // Redirect to welcome page
            router.push(`/${subdomain}`);
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-medi-green relative overflow-hidden items-center justify-center p-12">
                {/* Background decorations */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-medi-lime/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 text-center">
                    <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <span className="text-5xl font-bold text-white">{tenantInfo?.name?.[0] || 'P'}</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-4">{tenantInfo?.name || 'Pharmacy'}</h1>
                    <p className="text-white/70 text-lg mb-8">Staff Portal Access</p>

                    <div className="flex items-center justify-center gap-2 text-medi-lime">
                        <ShieldCheckIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Secure Login</span>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile header */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 bg-medi-green rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-white">{tenantInfo?.name?.[0] || 'P'}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">{tenantInfo?.name || 'Pharmacy'}</h1>
                        <p className="text-slate-500">Staff Login</p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                            <p className="text-slate-500 mt-1">Sign in to access your dashboard</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-red-600 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green transition-colors"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green transition-colors pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-medi-green focus:ring-medi-green" />
                                    <span className="text-sm text-slate-600">Remember me</span>
                                </label>
                                <Link href="/forgot-password" className="text-sm font-semibold text-medi-green hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-medi-green text-white rounded-xl font-bold hover:bg-medi-green/90 transition-colors shadow-lg shadow-medi-green/20 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Back to tenant home */}
                    <div className="mt-6 text-center">
                        <Link href={`/${subdomain}`} className="text-sm text-slate-500 hover:text-medi-green transition-colors">
                            ← Back to {tenantInfo?.name || 'Pharmacy'} Home
                        </Link>
                    </div>

                    {/* Powered by */}
                    <div className="mt-8 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                            <div className="w-5 h-5 bg-medi-green rounded flex items-center justify-center">
                                <span className="text-white text-[8px] font-bold">MH</span>
                            </div>
                            <span className="text-xs">Powered by MediHeal</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
