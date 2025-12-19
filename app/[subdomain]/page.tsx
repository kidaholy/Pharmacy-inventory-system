'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../lib/auth';
import {
    ArrowRightIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ClockIcon,
    ShieldCheckIcon,
    CubeIcon,
    UserGroupIcon,
    SparklesIcon,
    HeartIcon,
    TruckIcon,
    ChatBubbleLeftRightIcon,
    StarIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface TenantInfo {
    _id: string;
    name: string;
    subdomain: string;
    subscriptionPlan: string;
    contact: {
        email: string;
        phone?: string;
        address?: string;
        city?: string;
        country?: string;
    };
    branding?: {
        tagline?: string;
        description?: string;
        primaryColor?: string;
        businessHours?: string;
        services?: string[];
        testimonials?: { name: string; text: string; rating: number }[];
    };
}

export default function TenantLandingPage() {
    const params = useParams();
    const router = useRouter();
    const subdomain = params.subdomain as string;

    const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        loadTenantInfo();

        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [subdomain, router]);

    const loadTenantInfo = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/tenant/${subdomain}`);
            if (response.ok) {
                const data = await response.json();
                setTenantInfo(data);
            } else if (response.status === 404) {
                setError('Pharmacy not found');
            }
        } catch (err) {
            setError('Failed to connect');
        } finally {
            setLoading(false);
        }
    };

    // Default content (CMS will override these)
    const defaultServices = [
        { icon: CubeIcon, title: 'Quality Medicines', desc: 'Wide range of authenticated pharmaceutical products' },
        { icon: HeartIcon, title: 'Health Consultation', desc: 'Expert pharmacists available for health advice' },
        { icon: TruckIcon, title: 'Fast Delivery', desc: 'Quick and reliable medicine delivery service' },
        { icon: ShieldCheckIcon, title: 'Secure & Safe', desc: '100% genuine products with quality guarantee' },
    ];

    const defaultTestimonials = [
        { name: 'Sarah M.', text: 'Excellent service and genuine medicines. The staff is always helpful!', rating: 5 },
        { name: 'John D.', text: 'Fast delivery and great prices. My go-to pharmacy for all needs.', rating: 5 },
        { name: 'Emily R.', text: 'Very professional. They always have what I need in stock.', rating: 4 },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-medi-lime/20 rounded-full"></div>
                        <div className="w-20 h-20 border-4 border-medi-lime border-t-transparent rounded-full animate-spin absolute top-0"></div>
                    </div>
                    <p className="text-white/60 mt-6 font-medium">Loading pharmacy...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="text-center max-w-md glass-card p-12 rounded-3xl">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🏥</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">Pharmacy Not Found</h1>
                    <p className="text-white/60 mb-8">The pharmacy "{subdomain}" doesn't exist or is no longer active.</p>
                    <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-medi-lime text-slate-900 rounded-full font-bold hover:shadow-[0_0_40px_rgba(212,240,93,0.4)] transition-all">
                        Go to MediHeal Home
                        <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
            {/* Custom Styles */}
            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes reveal-up {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-gradient-x { animation: gradient-x 6s ease infinite; background-size: 200% 200%; }
        .animate-blob { animation: blob 8s ease-in-out infinite; }
        .glass-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .glass-card-hover:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(212, 240, 93, 0.3);
          transform: translateY(-8px);
        }
        .text-gradient {
          background: linear-gradient(135deg, #d4f05d 0%, #00ff88 50%, #d4f05d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .bg-mesh {
          background-image: 
            radial-gradient(at 0% 0%, rgba(212, 240, 93, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(0, 104, 64, 0.2) 0px, transparent 50%),
            radial-gradient(at 50% 50%, rgba(212, 240, 93, 0.05) 0px, transparent 50%);
        }
      `}</style>

            {/* Floating Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-medi-lime/10 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-medi-green/20 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '-4s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-medi-lime/5 to-transparent rounded-full"></div>
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-slate-900/90 backdrop-blur-xl border-b border-white/10' : ''}`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-medi-lime rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative w-14 h-14 bg-gradient-to-br from-medi-lime to-medi-green rounded-2xl flex items-center justify-center shadow-2xl">
                                    <span className="text-slate-900 font-black text-xl">{tenantInfo?.name?.[0] || 'P'}</span>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">{tenantInfo?.name}</h1>
                                <p className="text-xs text-medi-lime/80 font-medium">Powered by MediHeal</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link href={`/${subdomain}/login`} className="text-white/70 hover:text-white font-medium transition-colors px-4 py-2">
                                Staff Portal
                            </Link>
                            <Link
                                href={`/${subdomain}/dashboard`}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-medi-lime rounded-full blur-md opacity-50 group-hover:opacity-100 transition-all"></div>
                                <span className="relative flex items-center gap-2 px-6 py-3 bg-medi-lime text-slate-900 rounded-full font-bold shadow-lg hover:shadow-[0_0_30px_rgba(212,240,93,0.5)] transition-all">
                                    Dashboard
                                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 bg-mesh">
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full mb-8 animate-float">
                        <SparklesIcon className="w-5 h-5 text-medi-lime" />
                        <span className="text-white/80 text-sm font-medium">Your Trusted Healthcare Partner</span>
                        <CheckBadgeIcon className="w-5 h-5 text-medi-lime" />
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight">
                        <span className="text-white">Welcome to</span>
                        <br />
                        <span className="text-gradient animate-gradient-x">{tenantInfo?.name}</span>
                    </h1>

                    {/* Tagline */}
                    <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed">
                        {tenantInfo?.branding?.tagline || 'Your neighborhood pharmacy committed to providing quality healthcare products and personalized service for you and your family.'}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        <Link href={`/${subdomain}/dashboard`} className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-medi-lime to-green-400 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-all"></div>
                            <span className="relative flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-medi-lime to-green-400 text-slate-900 rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition-all">
                                <ShieldCheckIcon className="w-6 h-6" />
                                Enter Pharmacy Portal
                                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </span>
                        </Link>
                        <a href="#contact" className="flex items-center gap-3 px-10 py-5 glass-card rounded-full font-bold text-lg text-white hover:bg-white/10 transition-all border border-white/20">
                            <PhoneIcon className="w-6 h-6" />
                            Contact Us
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {[
                            { value: '10K+', label: 'Happy Customers' },
                            { value: '500+', label: 'Products Available' },
                            { value: '24/7', label: 'Support Available' },
                            { value: '99%', label: 'Satisfaction Rate' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
                                <p className="text-3xl md:text-4xl font-black text-medi-lime mb-1">{stat.value}</p>
                                <p className="text-white/50 text-sm font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-8 h-12 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
                        <div className="w-1.5 h-3 bg-medi-lime rounded-full animate-glow"></div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-medi-lime/10 text-medi-lime rounded-full text-sm font-bold mb-4">OUR SERVICES</span>
                        <h2 className="text-4xl md:text-5xl font-black mb-4">What We Offer</h2>
                        <p className="text-white/50 max-w-2xl mx-auto">Comprehensive healthcare services tailored to meet your needs</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {defaultServices.map((service, i) => (
                            <div key={i} className="glass-card glass-card-hover rounded-3xl p-8 transition-all duration-500 group">
                                <div className="w-16 h-16 bg-gradient-to-br from-medi-lime/20 to-medi-green/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <service.icon className="w-8 h-8 text-medi-lime" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                                <p className="text-white/50 leading-relaxed">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-32 px-6 bg-gradient-to-b from-transparent via-medi-green/5 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-medi-lime/10 text-medi-lime rounded-full text-sm font-bold mb-4">TESTIMONIALS</span>
                        <h2 className="text-4xl md:text-5xl font-black mb-4">What Our Customers Say</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {defaultTestimonials.map((testimonial, i) => (
                            <div key={i} className="glass-card rounded-3xl p-8 hover:bg-white/10 transition-all">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, j) => (
                                        j < testimonial.rating
                                            ? <StarSolidIcon key={j} className="w-5 h-5 text-medi-lime" />
                                            : <StarIcon key={j} className="w-5 h-5 text-white/20" />
                                    ))}
                                </div>
                                <p className="text-white/70 mb-6 leading-relaxed">"{testimonial.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-medi-lime to-medi-green rounded-full flex items-center justify-center">
                                        <span className="text-slate-900 font-bold text-sm">{testimonial.name[0]}</span>
                                    </div>
                                    <span className="text-white font-semibold">{testimonial.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="glass-card rounded-[40px] p-12 md:p-16 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-medi-lime/10 rounded-full blur-[100px]"></div>

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div>
                                <span className="inline-block px-4 py-2 bg-medi-lime/10 text-medi-lime rounded-full text-sm font-bold mb-4">CONTACT US</span>
                                <h2 className="text-4xl md:text-5xl font-black mb-6">Get In Touch</h2>
                                <p className="text-white/50 mb-8 leading-relaxed">We're here to help with all your healthcare needs. Reach out to us anytime.</p>

                                <div className="space-y-4">
                                    {tenantInfo?.contact?.phone && (
                                        <a href={`tel:${tenantInfo.contact.phone}`} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                                            <div className="w-12 h-12 bg-medi-lime/10 rounded-xl flex items-center justify-center group-hover:bg-medi-lime/20 transition-colors">
                                                <PhoneIcon className="w-6 h-6 text-medi-lime" />
                                            </div>
                                            <div>
                                                <p className="text-white/40 text-sm">Call Us</p>
                                                <p className="text-white font-semibold">{tenantInfo.contact.phone}</p>
                                            </div>
                                        </a>
                                    )}

                                    {tenantInfo?.contact?.email && (
                                        <a href={`mailto:${tenantInfo.contact.email}`} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                                            <div className="w-12 h-12 bg-medi-lime/10 rounded-xl flex items-center justify-center group-hover:bg-medi-lime/20 transition-colors">
                                                <EnvelopeIcon className="w-6 h-6 text-medi-lime" />
                                            </div>
                                            <div>
                                                <p className="text-white/40 text-sm">Email Us</p>
                                                <p className="text-white font-semibold">{tenantInfo.contact.email}</p>
                                            </div>
                                        </a>
                                    )}

                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                                        <div className="w-12 h-12 bg-medi-lime/10 rounded-xl flex items-center justify-center">
                                            <MapPinIcon className="w-6 h-6 text-medi-lime" />
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-sm">Visit Us</p>
                                            <p className="text-white font-semibold">{tenantInfo?.contact?.city || tenantInfo?.contact?.address || 'Contact for location'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                                        <div className="w-12 h-12 bg-medi-lime/10 rounded-xl flex items-center justify-center">
                                            <ClockIcon className="w-6 h-6 text-medi-lime" />
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-sm">Business Hours</p>
                                            <p className="text-white font-semibold">{tenantInfo?.branding?.businessHours || 'Mon - Sat: 8AM - 8PM'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Contact Form */}
                            <div className="bg-white/5 rounded-3xl p-8">
                                <h3 className="text-xl font-bold mb-6">Send us a message</h3>
                                <form className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-medi-lime/50 transition-colors"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Your Email"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-medi-lime/50 transition-colors"
                                    />
                                    <textarea
                                        placeholder="Your Message"
                                        rows={4}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-medi-lime/50 transition-colors resize-none"
                                    ></textarea>
                                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-medi-lime to-green-400 text-slate-900 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(212,240,93,0.4)] transition-all">
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-medi-lime to-medi-green rounded-xl flex items-center justify-center">
                                <span className="text-slate-900 font-bold">{tenantInfo?.name?.[0]}</span>
                            </div>
                            <span className="text-white font-bold text-lg">{tenantInfo?.name}</span>
                        </div>

                        <p className="text-white/40 text-sm">© {new Date().getFullYear()} {tenantInfo?.name}. All rights reserved.</p>

                        <div className="flex items-center gap-2 text-white/40">
                            <span className="text-xs">Powered by</span>
                            <div className="w-5 h-5 bg-medi-green rounded flex items-center justify-center">
                                <span className="text-white text-[8px] font-bold">MH</span>
                            </div>
                            <span className="text-xs font-semibold text-white/60">MediHeal</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
