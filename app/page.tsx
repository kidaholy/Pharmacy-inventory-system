'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Package, CreditCard, Cloud, ArrowRight, BarChart3, Shield, Zap, Users, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    // Scroll Reveal Animation Logic with bi-directional animations
    useEffect(() => {
        setIsLoaded(true);

        // Parallax scroll effect
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target as HTMLElement;
                const delay = element.dataset.delay || '0';

                if (entry.isIntersecting) {
                    // Element entering viewport - animate in
                    element.style.transitionDelay = `${delay}ms`;
                    element.classList.add('active');
                } else {
                    // Element leaving viewport - animate out (reverse)
                    element.style.transitionDelay = '0ms';
                    element.classList.remove('active');
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        elements.forEach((el, index) => {
            (el as HTMLElement).dataset.delay = String(index * 80); // Slightly faster stagger
            observer.observe(el);
        });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden font-sans">
            {/* Custom Animation Styles */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(3deg); }
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(212, 240, 93, 0.3); }
                    50% { box-shadow: 0 0 40px rgba(212, 240, 93, 0.6); }
                }
                
                /* Reveal animations */
                .reveal {
                    opacity: 0;
                    transform: translateY(60px);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .reveal.active {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .reveal-left {
                    opacity: 0;
                    transform: translateX(-60px);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .reveal-left.active {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                .reveal-right {
                    opacity: 0;
                    transform: translateX(60px);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .reveal-right.active {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                .reveal-scale {
                    opacity: 0;
                    transform: scale(0.8);
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .reveal-scale.active {
                    opacity: 1;
                    transform: scale(1);
                }

                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
                
                /* Stagger delays */
                .stagger-1 { transition-delay: 0.1s !important; }
                .stagger-2 { transition-delay: 0.2s !important; }
                .stagger-3 { transition-delay: 0.3s !important; }
                .stagger-4 { transition-delay: 0.4s !important; }
                .stagger-5 { transition-delay: 0.5s !important; }
                .stagger-6 { transition-delay: 0.6s !important; }
            `}</style>

            {/* Navigation */}
            <nav className={`fixed top-6 left-0 right-0 z-50 max-w-7xl mx-auto px-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                <div className="bg-white/90 backdrop-blur-md rounded-full py-3 px-8 flex items-center justify-between shadow-xl border border-white/20 hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-medi-green rounded-xl flex items-center justify-center shadow-lg hover:rotate-12 transition-transform duration-300">
                            <span className="text-white font-bold text-sm">MH</span>
                        </div>
                        <span className="font-extrabold text-2xl tracking-tighter text-medi-green">MediHeal</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600">
                        <Link href="#features" className="hover:text-medi-green transition-colors duration-300 relative group">
                            Core Modules
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-medi-green transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link href="#stats" className="hover:text-medi-green transition-colors duration-300 relative group">
                            Why Us
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-medi-green transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link href="#cta" className="hover:text-medi-green transition-colors duration-300 relative group">
                            Get Started
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-medi-green transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-medi-green hidden md:block hover:underline transition-all">Client Login</Link>
                        <Link
                            href="/register"
                            className="bg-medi-green text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2"
                        >
                            Start Free Trial
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Header / Hero Section */}
            <header className="bg-medi-green rounded-b-[60px] pt-40 pb-32 px-6 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-medi-lime/10 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float-slow"></div>
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-medi-lime/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center relative z-10">
                    <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6 hover:bg-white/15 transition-colors cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medi-lime opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-medi-lime"></span>
                            </span>
                            <span className="text-white text-xs font-bold uppercase tracking-widest">Multi-Tenant Cloud Platform</span>
                        </div>
                        <h1 className="text-5xl lg:text-8xl font-extrabold text-white leading-[0.9] mb-8 tracking-tighter">
                            Revolutionizing <br />
                            <span className="text-medi-lime inline-block hover:scale-105 transition-transform duration-300 cursor-default">Pharmacy</span> <br />
                            Operations.
                        </h1>
                        <p className="text-white/70 text-lg md:text-xl mb-12 max-w-lg leading-relaxed">
                            Introducing a cloud-based management system for enhanced efficiency in pharmacies. Secure, scalable, and built for growth.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/register"
                                className="bg-medi-lime text-medi-green px-10 py-4 rounded-full font-black text-lg hover:shadow-[0_0_40px_rgba(212,240,93,0.5)] transition-all duration-300 inline-block hover:scale-105 active:scale-95 animate-pulse-glow"
                            >
                                Get Started Free
                            </Link>
                            <button className="bg-white/5 border border-white/20 text-white px-10 py-4 rounded-full font-bold hover:bg-white/15 hover:border-white/40 transition-all duration-300 group flex items-center gap-2">
                                Watch Demo
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Hero Image / Graphic */}
                    <div className={`relative mt-20 lg:mt-0 flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                        <div className="absolute -bottom-20 right-0 text-[100px] lg:text-[180px] font-black text-white/5 tracking-tighter select-none -z-10 leading-none">PMS 2025</div>

                        {/* Main Hero Card */}
                        <div className="relative w-full max-w-md lg:max-w-lg aspect-[3/4] bg-gradient-to-br from-white/10 to-white/5 rounded-[40px] border border-white/20 backdrop-blur-sm overflow-hidden p-6 flex flex-col items-center justify-end shadow-2xl hover:shadow-[0_0_60px_rgba(0,0,0,0.3)] transition-all duration-500 group">
                            <div className="absolute inset-0 bg-gradient-to-t from-medi-green/80 to-transparent z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-medi-lime/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-5"></div>
                            <img
                                src="/pharmacist.png"
                                alt="Pharmacist"
                                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay"
                            />
                            <div className="relative z-20 text-center mb-8 group-hover:scale-105 transition-transform duration-500">
                                <div className="w-16 h-16 bg-medi-lime rounded-2xl mx-auto mb-4 flex items-center justify-center text-medi-green shadow-lg">
                                    <Package className="w-8 h-8" />
                                </div>
                                <h3 className="text-white font-bold text-2xl mb-2">Smart Inventory</h3>
                                <p className="text-white/80 text-sm">Automated tracking & reordering</p>
                            </div>
                        </div>

                        {/* Floating Card - Analytics */}
                        <div className="absolute top-1/4 -left-4 lg:-left-10 bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 animate-float hover:scale-110 transition-transform duration-300 cursor-default">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Real-time Tracking</p>
                                    <p className="text-sm font-black text-slate-800">Inventory Syncing...</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Card - Security */}
                        <div className="absolute bottom-1/4 -right-4 lg:-right-8 bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 animate-float-slow hover:scale-110 transition-transform duration-300 cursor-default" style={{ animationDelay: '1s' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Data Protection</p>
                                    <p className="text-sm font-black text-slate-800">256-bit Encrypted</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Section */}
            <section id="stats" className="py-20 px-6 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '500+', label: 'Pharmacies Trust Us', icon: Users },
                            { value: '99.9%', label: 'Uptime Guarantee', icon: Zap },
                            { value: '50M+', label: 'Transactions Processed', icon: CreditCard },
                            { value: '24/7', label: 'Expert Support', icon: Shield },
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className={`reveal-scale text-center p-6 rounded-3xl bg-slate-50 hover:bg-medi-green/5 border border-transparent hover:border-medi-green/20 transition-all duration-500 group cursor-default stagger-${index + 1}`}
                            >
                                <div className="w-14 h-14 bg-medi-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-medi-green/20 transition-all duration-300">
                                    <stat.icon className="w-7 h-7 text-medi-green" />
                                </div>
                                <p className="text-4xl font-extrabold text-medi-green mb-2 group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                                <p className="text-slate-500 font-medium text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6 bg-slate-50 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-medi-green/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-medi-lime/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20 reveal">
                        <span className="inline-block px-4 py-2 bg-medi-green/10 text-medi-green rounded-full text-sm font-bold mb-4">Powerful Features</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Core System Modules</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">A multi-tenant SaaS Pharmacy Management System that digitally transforms your operations end-to-end.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Inventory Card */}
                        <div className="reveal-left stagger-1 bg-white p-10 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 group hover:-translate-y-2">
                            <div className="w-16 h-16 bg-medi-green/5 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-medi-green group-hover:shadow-lg transition-all duration-300">
                                <Package className="w-8 h-8 text-medi-green group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 group-hover:text-medi-green transition-colors">Inventory Management</h3>
                            <ul className="text-slate-500 space-y-3 text-sm">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-medi-green flex-shrink-0" />
                                    Medicine batch & expiry tracking
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-medi-green flex-shrink-0" />
                                    Barcode scanning & stock alerts
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-medi-green flex-shrink-0" />
                                    Real-time stock forecasting
                                </li>
                            </ul>
                        </div>

                        {/* POS Card */}
                        <div className="reveal stagger-2 bg-white p-10 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 group hover:-translate-y-2">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:shadow-lg transition-all duration-300">
                                <CreditCard className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-600 transition-colors">Sales & Billing (POS)</h3>
                            <ul className="text-slate-500 space-y-3 text-sm">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    Fast billing & digital receipts
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    Automated tax & discounts
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    Real-time profit/loss reports
                                </li>
                            </ul>
                        </div>

                        {/* SaaS Card */}
                        <div className="reveal-right stagger-3 bg-white p-10 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 group hover:-translate-y-2">
                            <div className="w-16 h-16 bg-medi-lime/20 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-medi-lime group-hover:shadow-lg transition-all duration-300">
                                <Cloud className="w-8 h-8 text-medi-green transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 group-hover:text-medi-green transition-colors">SaaS Multi-Tenant</h3>
                            <ul className="text-slate-500 space-y-3 text-sm">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-medi-green flex-shrink-0" />
                                    Isolated database & data security
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-medi-green flex-shrink-0" />
                                    Custom pharmacy branding
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-medi-green flex-shrink-0" />
                                    Scalable for pharmacy chains
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="cta" className="py-32 px-6 bg-medi-green relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-medi-lime/10 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float-slow"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="reveal-scale text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                        Ready to Transform Your Pharmacy?
                    </h2>
                    <p className="reveal text-white/70 text-xl mb-10 max-w-2xl mx-auto stagger-1">
                        Join 500+ pharmacies already using MediHeal to streamline their operations and boost efficiency.
                    </p>
                    <div className="reveal flex flex-wrap justify-center gap-4 stagger-2">
                        <Link
                            href="/register"
                            className="bg-medi-lime text-medi-green px-12 py-5 rounded-full font-black text-lg hover:shadow-[0_0_50px_rgba(212,240,93,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                        >
                            Start Your Free Trial
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/login"
                            className="bg-white/10 border border-white/30 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
                        >
                            Login to Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="reveal flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-2 mb-6 md:mb-0 group">
                            <div className="w-10 h-10 bg-medi-green rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                                <span className="text-white font-bold text-sm">MH</span>
                            </div>
                            <span className="font-extrabold text-2xl tracking-tighter text-white">MediHeal</span>
                        </div>
                        <p className="text-slate-400 text-sm">© 2025 MediHeal Cloud. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
