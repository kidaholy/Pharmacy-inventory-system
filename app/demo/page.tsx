'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    Sparkles,
    BadgeCheck,
    Package,
    Heart,
    Truck,
    ShieldCheck,
    Users,
    Clock,
    Star,
    Phone,
    Mail,
    MapPin,
    Globe,
    ArrowUpRight,
    Monitor,
    Smartphone,
    Layout,
    Info,
    X,
    Activity,
    Layers,
    Lock
} from 'lucide-react';

export default function DemoShowcase() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [activeModal, setActiveModal] = useState<string | null>(null);

    useEffect(() => {
        setIsLoaded(true);
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });

        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        elements.forEach(el => observer.observe(el));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    const defaultServices = [
        { icon: Package, title: 'Quality Medicines', desc: 'Authenticated pharmaceutical products for your safety.' },
        { icon: Heart, title: 'Health Consultation', desc: 'Expert pharmacists available for personalized advice.' },
        { icon: Truck, title: 'Fast Delivery', desc: 'Quick and reliable delivery service for your meds.' },
        { icon: ShieldCheck, title: 'Secure & Safe', desc: 'Genuine products with categorical quality guarantee.' },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden font-sans selection:bg-medi-lime selection:text-slate-950">
            <style jsx>{`
                .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .reveal-left { opacity: 0; transform: translateX(-30px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .reveal-right { opacity: 0; transform: translateX(30px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .reveal-scale { opacity: 0; transform: scale(0.95); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .active { opacity: 1; transform: translate(0) scale(1); }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(0, 104, 64, 0.05);
                }

                .hero-gradient {
                    background: linear-gradient(135deg, #004d32 0%, #006840 50%, #004d32 100%);
                }
                
                .text-gradient {
                    background: linear-gradient(135deg, #d4f05d 0%, #00ff88 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -20px) scale(1.05); }
                    66% { transform: translate(-20px, 10px) scale(0.95); }
                }
                .animate-blob { animation: blob 10s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); }

                .nav-scrolled {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    padding: 1rem 0;
                }

                .demo-badge {
                    animation: float 4s infinite ease-in-out;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>

            {/* Showcase Overlay (Floating Header) */}
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
                <div className="reveal-scale bg-white/90 backdrop-blur-xl border-2 border-medi-green/20 px-8 py-3 rounded-full flex items-center gap-4 shadow-2xl pointer-events-auto hover:scale-105 transition-transform">
                    <div className="w-8 h-8 bg-medi-green rounded-lg flex items-center justify-center text-white">
                        <Monitor className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-black tracking-tight text-slate-800">
                        <span className="text-medi-green">Tenant Experience</span> Showcase
                    </p>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <button
                        onClick={() => setActiveModal('specs')}
                        className="text-[10px] font-black uppercase tracking-widest text-medi-green hover:underline"
                    >
                        Design Specs
                    </button>
                </div>
            </div>

            {/* Navigation (Mirrored from Tenant Landing) */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-6 px-6 ${scrollY > 50 ? 'nav-scrolled shadow-sm' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group">
                            <span className="font-black text-xl text-medi-green">
                                P
                            </span>
                        </div>
                        <div>
                            <h1 className={`font-black text-xl tracking-tighter ${scrollY > 50 ? 'text-slate-900' : 'text-white'}`}>
                                Demo Pharmacy
                            </h1>
                            <div className="flex items-center gap-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${scrollY > 50 ? 'text-medi-green' : 'text-medi-lime'}`}>Verified Pharmacy</span>
                                <BadgeCheck className={`w-3 h-3 ${scrollY > 50 ? 'text-medi-green' : 'text-medi-lime'}`} />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/" className={`text-sm font-bold transition-colors ${scrollY > 50 ? 'text-slate-500 hover:text-medi-green' : 'text-white/70 hover:text-white'}`}>
                            Exit Demo
                        </Link>
                        <Link href="/register" className="px-6 py-3 bg-medi-lime text-slate-950 text-sm font-black rounded-full hover:scale-105 transition-all shadow-lg">
                            Get Your Own Site
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-48 pb-32 px-6 hero-gradient overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-medi-lime/40 rounded-full blur-[120px] animate-blob"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/20 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="reveal inline-flex items-center gap-2 bg-white/10 border border-white/10 px-5 py-2 rounded-full mb-10 backdrop-blur-md">
                        <Sparkles className="w-4 h-4 text-medi-lime" />
                        <span className="text-white text-xs font-black uppercase tracking-widest">Client Portal Showcase</span>
                    </div>
                    <h1 className="reveal text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                        Your Health, <br />
                        <span className="text-gradient">Our Priority.</span>
                    </h1>
                    <p className="reveal text-white/70 text-xl md:text-2xl max-w-3xl mx-auto mb-16 leading-relaxed font-medium">
                        This is a live preview of how your pharmacy's landing page will look for your customers. Premium, responsive, and trustworthy.
                    </p>

                    <div className="reveal flex flex-wrap justify-center gap-6 stagger-2">
                        <button className="group px-12 py-6 bg-medi-lime text-slate-950 rounded-full font-black text-xl hover:shadow-[0_0_50px_rgba(212,240,93,0.5)] transition-all flex items-center gap-3">
                            Check Services
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="px-12 py-6 border-2 border-white/20 text-white rounded-full font-black text-xl hover:bg-white/10 transition-all">
                            View Dashboard
                        </button>
                    </div>

                    <div className="reveal mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto stagger-3">
                        {[
                            { value: '10K+', label: 'Patients', icon: Users },
                            { value: '24/7', label: 'Availability', icon: Clock },
                            { value: '100%', label: 'Authentic', icon: ShieldCheck },
                            { value: 'Verified', label: 'Ministry of Health', icon: BadgeCheck }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm group hover:bg-white/10 transition-colors">
                                <div className="flex justify-center mb-3">
                                    <stat.icon className="w-5 h-5 text-medi-lime" />
                                </div>
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Services Grid */}
            <main className="relative z-10 bg-white pt-32 pb-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20">
                        <div className="reveal-left">
                            <span className="text-medi-green font-black uppercase tracking-widest text-sm mb-4 block">Holistic Healthcare</span>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9]">Exceptional <br /> <span className="text-slate-400">Pharmacy Services.</span></h2>
                        </div>
                        <p className="reveal-right text-slate-500 text-lg max-w-md mt-8 md:mt-0 italic border-l-4 border-medi-lime pl-6">
                            "Showcase how you present your services to your local community with elegance."
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {defaultServices.map((service, i) => (
                            <div key={i} className="reveal-scale group p-10 rounded-[40px] border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-medi-green/20 hover:shadow-2xl hover:shadow-medi-green/5 transition-all duration-500">
                                <div className="w-16 h-16 bg-medi-green/5 rounded-[24px] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-medi-green group-hover:text-white transition-all duration-500">
                                    <service.icon className="w-8 h-8 text-medi-green group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 group-hover:text-medi-green transition-colors">{service.title}</h3>
                                <p className="text-slate-500 leading-relaxed mb-6 font-medium">{service.desc}</p>
                                <div className="flex items-center gap-2 text-sm font-bold text-medi-green group-hover:gap-4 transition-all uppercase tracking-widest">
                                    Learn More <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Interactive Specs Modal */}
            {activeModal === 'specs' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
                    <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[40px] p-12 overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-8">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-10">
                            <span className="text-medi-green font-black uppercase tracking-widest text-xs mb-4 block">Design Blueprint</span>
                            <h2 className="text-4xl font-black mb-4 tracking-tighter">Tenant Landing Specs</h2>
                            <p className="text-slate-400 font-medium">Technical details of the pharmacy storefront architecture.</p>
                        </div>

                        <div className="space-y-8">
                            {[
                                { title: "Forest Green Hero", desc: "Signature brand identity with high-contrast Lime gradients for CTA visibility.", icon: Globe },
                                { title: "Custom CMS Integration", desc: "Merchants can update taglines, services, and contact info in real-time.", icon: Layers },
                                { title: "Responsive Micro-Animations", desc: "IntersectionObserver-driven reveal effects for a high-end, smooth feel.", icon: Activity },
                                { title: "Patient Trust Layers", desc: "Integrated verification badges and professional typography for medical credibility.", icon: ShieldCheck }
                            ].map((spec, idx) => (
                                <div key={idx} className="flex gap-6 items-start group">
                                    <div className="w-12 h-12 rounded-2xl bg-medi-green/5 border border-medi-green/10 flex items-center justify-center flex-shrink-0 group-hover:bg-medi-green group-hover:text-white transition-all">
                                        <spec.icon className="w-5 h-5 text-medi-green group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black mb-1 text-slate-900">{spec.title}</h4>
                                        <p className="text-slate-500 font-medium leading-relaxed">{spec.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-10 border-t border-slate-100 flex justify-between items-center">
                            <Link href="/register" className="px-8 py-4 bg-medi-green text-white rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all">
                                Claim This Design
                            </Link>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="text-medi-green font-black text-sm uppercase tracking-widest hover:underline"
                            >
                                Close Specs
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Testimonials */}
            <section className="py-40 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-medi-green/5 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="reveal text-5xl md:text-7xl font-black tracking-tighter mb-6">Patient <span className="text-medi-green">Confidence.</span></h2>
                        <div className="reveal w-24 h-2 bg-medi-green mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: 'Alice W.', text: 'The interface is so professional, I trust ordering my meds here every time.', rating: 5 },
                            { name: 'Robert K.', text: 'Fast, clean, and reliable. Exactly what a modern pharmacy should be.', rating: 5 },
                            { name: 'Sarah L.', text: 'I love being able to see all services and contact info clearly.', rating: 5 },
                        ].map((t, i) => (
                            <div key={i} className="reveal-scale p-12 bg-white rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-slate-100 group">
                                <div className="flex gap-1 mb-8">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="w-5 h-5 text-medi-lime fill-medi-lime" />
                                    ))}
                                </div>
                                <p className="text-xl text-slate-600 mb-10 leading-relaxed font-black">"{t.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-medi-green rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900">{t.name}</p>
                                        <p className="text-xs font-bold text-medi-green uppercase tracking-widest">Verified User</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-40 bg-white border-t border-slate-50 px-6 text-center">
                <div className="max-w-7xl mx-auto">
                    <div className="w-24 h-24 bg-medi-green/5 rounded-[32px] flex items-center justify-center mx-auto mb-12">
                        <Monitor className="w-12 h-12 text-medi-green" />
                    </div>
                    <h2 className="text-6xl font-black tracking-tighter text-slate-950 mb-12 leading-none">Ready to transform your <br /> <span className="text-medi-green">Pharmacy Brand?</span></h2>

                    <div className="flex flex-wrap justify-center gap-6">
                        <Link href="/register" className="px-16 py-7 bg-medi-green text-white rounded-full font-black text-2xl hover:shadow-[0_0_60px_rgba(0,104,64,0.3)] transition-all flex items-center gap-4 hover:scale-105">
                            Start Free Trial
                            <ArrowRight className="w-8 h-8" />
                        </Link>
                        <Link href="/" className="px-16 py-7 border-2 border-slate-100 rounded-full font-black text-2xl hover:bg-slate-50 transition-all">
                            Back to Site
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
