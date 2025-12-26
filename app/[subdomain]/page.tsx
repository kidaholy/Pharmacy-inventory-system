'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../../lib/contexts/LanguageContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import {
  ShieldCheck,
  Clock,
  Users,
  Heart,
  Phone,
  MapPin,
  Mail,
  ArrowRight,
  Activity,
  Package,
  Truck,
  Zap,
  Sparkles,
  ArrowUpRight,
  Plus,
  Globe,
  Microscope,
  Menu,
  X
} from 'lucide-react';

interface TenantInfo {
  _id: string;
  name: string;
  subdomain: string;
  contact: {
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  settings?: {
    branding?: {
      logo?: string;
      heroTitle?: string;
      heroSubtitle?: string;
      heroImage?: string;
      deliveryImage?: string;
      consultationImage?: string;
      contactMessage?: string;
      businessHours?: string;
    }
  };
  subscriptionPlan: string;
}

interface CmsData {
  hero: {
    title: string;
    subtitle: string;
    image: string;
  };
  services: Array<{
    title: string;
    description: string;
    image: string;
    icon?: string;
  }>;
  stats: Array<{
    label: string;
    value: string;
  }>;
  testimonials: Array<{
    name: string;
    text: string;
    rating: number;
    avatar?: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  contact: {
    message: string;
    businessHours?: string;
  };
}

export default function TenantLandingPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [cmsData, setCmsData] = useState<CmsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    loadAllData();

    // "Real-time" Sync: Refetch on window focus or every 30 seconds
    const handleFocus = () => loadAllData(true);
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(() => loadAllData(true), 30000);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const observerOptions = { threshold: 0.1, rootMargin: '0px' };
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
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [subdomain]);

  const loadAllData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const [tenantRes, cmsRes] = await Promise.all([
        fetch(`/api/tenant/${subdomain}`),
        fetch(`/api/tenant/${subdomain}/cms`)
      ]);

      if (tenantRes.ok) {
        const data = await tenantRes.json();
        setTenantInfo(data);
        document.title = `${data.name} - Trusted Pharmacy`;
      }

      if (cmsRes.ok) {
        const data = await cmsRes.json();
        setCmsData(data);
      }
    } catch (error) {
      console.error('Error loading page data:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Activity className="w-12 h-12 text-medi-green animate-pulse" />
      </div>
    );
  }

  const pharmacyName = tenantInfo?.name || subdomain;
  const branding = tenantInfo?.settings?.branding;

  // Final structured merge: CMS Database > Legacy Branding > Defaults
  const heroData = cmsData?.hero || {
    title: branding?.heroTitle || 'Pharmacy <br /><span class="text-medi-lime">Perfected.</span>',
    subtitle: branding?.heroSubtitle || `Experience the future of pharmaceutical care. ${pharmacyName} combines expert knowledge with cutting-edge logistics for your family.`,
    image: branding?.heroImage || "/pharmacist.png"
  };

  const servicesData = cmsData?.services?.length ? cmsData.services : [
    { icon: 'ShieldCheck', title: 'Authenticity Guarantee', description: 'Every product is verified through our strict quality protocols.', image: '' },
    { icon: 'Truck', title: 'Express Delivery', description: 'Secure and timely delivery of your essential medications.', image: branding?.deliveryImage || '/service-delivery.png' },
    { icon: 'Heart', title: 'Professional Consultation', description: 'Expert pharmacists available for your health concerns.', image: branding?.consultationImage || '/service-consultation.png' }
  ];

  const contactData = cmsData?.contact || {
    message: branding?.contactMessage || 'Get In Touch.',
    businessHours: branding?.businessHours || 'Mon - Sat: 8AM - 8PM'
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-medi-green selection:text-white overflow-hidden" lang={language}>
      <style jsx>{`
        .reveal { opacity: 0; transform: translateY(20px); transition: all 0.6s ease-out; }
        .reveal-left { opacity: 0; transform: translateX(-20px); transition: all 0.6s ease-out; }
        .reveal-right { opacity: 0; transform: translateX(20px); transition: all 0.6s ease-out; }
        .reveal-scale { opacity: 0; transform: scale(0.95); transition: all 0.6s ease-out; }
        .active { opacity: 1 !important; transform: translate(0) scale(1) !important; }
        
        .mesh-gradient {
          background: linear-gradient(135deg, #004d32 0%, #006840 100%);
        }

        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .float { animation: float 6s ease-in-out infinite; }

        .img-overlay {
          background: linear-gradient(to top, rgba(0, 104, 64, 0.8) 0%, transparent 60%);
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {branding?.logo ? (
              <img src={branding.logo} alt={pharmacyName} className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 bg-medi-green rounded-xl flex items-center justify-center text-white font-black shadow-lg">
                {pharmacyName[0].toUpperCase()}
              </div>
            )}
            <h1 className={`font-black text-xl tracking-tighter ${scrollY > 50 ? 'text-slate-950' : 'text-white'}`}>
              {pharmacyName}
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <LanguageSwitcher variant="dark" />
            <Link href={`/${subdomain}/login`} className={`text-xs font-black uppercase tracking-widest ${scrollY > 50 ? 'text-slate-500' : 'text-white/70'}`}>Staff Login</Link>
            <Link href={`/${subdomain}/dashboard`} className="px-6 py-3 bg-medi-lime text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg">Dashboard</Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${scrollY > 50 ? 'text-slate-950 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Menu */}
        <div className={`md:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {branding?.logo ? (
                  <img src={branding.logo} alt={pharmacyName} className="w-8 h-8 object-contain" />
                ) : (
                  <div className="w-8 h-8 bg-medi-green rounded-lg flex items-center justify-center text-white font-black text-sm">
                    {pharmacyName[0].toUpperCase()}
                  </div>
                )}
                <span className="font-black text-lg text-slate-950">{pharmacyName}</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Close mobile menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Navigation Links */}
                <div className="space-y-4">
                  <a
                    href="#services"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <Heart className="w-5 h-5 text-medi-green" />
                    <span className="font-bold text-slate-900 group-hover:text-medi-green transition-colors">{t.tenant.ourServices}</span>
                  </a>
                  <a
                    href="#faq"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <Package className="w-5 h-5 text-medi-green" />
                    <span className="font-bold text-slate-900 group-hover:text-medi-green transition-colors">FAQ</span>
                  </a>
                  <a
                    href="#contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <Phone className="w-5 h-5 text-medi-green" />
                    <span className="font-bold text-slate-900 group-hover:text-medi-green transition-colors">{t.tenant.contactUs}</span>
                  </a>
                </div>

                {/* Language Switcher */}
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="w-5 h-5 text-slate-500" />
                    <span className="font-bold text-slate-700 text-sm uppercase tracking-widest">Language</span>
                  </div>
                  <LanguageSwitcher variant="light" />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 border-t border-slate-100 pt-6">
                  <Link
                    href={`/${subdomain}/login`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full p-4 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-medi-green hover:text-medi-green transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    Staff Login
                  </Link>
                  <Link
                    href={`/${subdomain}/dashboard`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full p-4 bg-medi-lime text-slate-950 rounded-xl font-black hover:shadow-lg transition-all"
                  >
                    <Activity className="w-5 h-5" />
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Menu Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <span>Powered by</span>
                <div className="w-5 h-5 bg-medi-green rounded flex items-center justify-center text-white font-black text-[8px]">MH</div>
                <span className="font-bold text-slate-700">MediHeal</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative min-h-[90vh] flex items-center px-4 md:px-6 mesh-gradient pt-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-medi-lime rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 order-2 lg:order-1`}>
            <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 md:mb-8">
              <Sparkles className="w-4 h-4 text-medi-lime" />
              <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Verified Healthcare Node</span>
            </div>
            <h1
              className="text-4xl md:text-6xl lg:text-8xl font-black text-white mb-6 md:mb-8 tracking-tighter leading-[0.85]"
              dangerouslySetInnerHTML={{ __html: heroData.title }}
            />
            <p className="text-white/70 text-base md:text-lg lg:text-xl max-w-xl mb-8 md:mb-12 leading-relaxed font-medium">
              {heroData.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-6">
              <button className="px-8 md:px-10 py-4 md:py-5 bg-medi-lime text-slate-950 rounded-2xl font-black text-base md:text-lg hover:shadow-[0_0_40px_rgba(212,240,93,0.4)] transition-all flex items-center justify-center gap-3">
                {t.tenant.ourServices} <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 md:px-10 py-4 md:py-5 glass text-white rounded-2xl font-black text-base md:text-lg hover:bg-white/10 transition-all">
                Staff Portal
              </button>
            </div>
          </div>

          <div className={`relative order-1 lg:order-2 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-all duration-1000 delay-300`}>
            <div className="relative aspect-[4/5] max-w-sm md:max-w-md mx-auto rounded-[40px] md:rounded-[60px] overflow-hidden border-4 md:border-8 border-white/10 shadow-3xl group">
              <img
                src={heroData.image}
                alt="Pharmacist"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 img-overlay flex flex-col justify-end p-6 md:p-10">
                <div className="glass p-4 md:p-6 rounded-2xl md:rounded-3xl">
                  <p className="text-xs font-bold text-medi-lime uppercase tracking-widest mb-1">Live Inventory</p>
                  <p className="text-xl md:text-2xl font-black text-white tracking-tight">Syncing All Systems...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Services */}
      <section id="services" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16">
            <div className="reveal active">
              <span className="text-medi-green font-black uppercase tracking-widest text-xs mb-4 block">{t.tenant.ourServices}</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Medical Excellence.</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {servicesData.map((s, i) => {
              const IconComponent = s.icon === 'ShieldCheck' ? ShieldCheck : s.icon === 'Truck' ? Truck : Heart;
              return (
                <div key={i} className="reveal-scale group relative overflow-hidden rounded-[30px] md:rounded-[40px] border border-slate-100 hover:shadow-3xl transition-all duration-500 active">
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                    {s.image ? (
                      <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-medi-green/5">
                        <IconComponent className="w-16 h-16 text-medi-green/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-medi-green" />
                    </div>
                  </div>
                  <div className="p-6 md:p-10 bg-white">
                    <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 group-hover:text-medi-green transition-colors">{s.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-4 md:mb-6 italic text-sm md:text-base">"{s.description}"</p>
                    <div className="flex items-center gap-2 text-xs font-black text-medi-green uppercase tracking-widest">
                      Identify Source <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-8 md:mb-12 text-center">Common Questions</h2>
          <div className="space-y-3 md:space-y-4">
            {(cmsData?.faq?.length ? cmsData.faq : [
              { question: "How do I order?", answer: "Register for an account or visit us in-person with your prescription." },
              { question: "Is delivery safe?", answer: "Yes, we use temperature-controlled logistics for all sensitive meds." },
              { question: "Can I chat with a pharmacist?", answer: "Absolutely. Use our portal to schedule a virtual consultation." }
            ]).map((f, i) => (
              <details key={i} className="bg-white rounded-[20px] md:rounded-[30px] border border-slate-200 overflow-hidden">
                <summary className="p-6 md:p-8 cursor-pointer list-none font-black text-base md:text-lg flex justify-between items-center group">
                  {f.question || (f as any).q}
                  <Plus className="w-5 h-5 text-medi-green group-open:hidden" />
                </summary>
                <div className="px-6 md:px-8 pb-6 md:pb-8 text-slate-500 font-medium border-t border-slate-50 pt-4 md:pt-6 text-sm md:text-base">
                  {f.answer || (f as any).a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-slate-950 rounded-[40px] md:rounded-[60px] p-8 md:p-12 lg:p-20 grid lg:grid-cols-2 gap-12 md:gap-20">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 md:mb-8 tracking-tighter">
                {contactData.message}
              </h2>
              <div className="space-y-4 md:space-y-6">
                {[
                  { icon: Phone, label: 'Phone', value: tenantInfo?.contact?.phone || '+1 234 567 890' },
                  { icon: Mail, label: 'Email', value: tenantInfo?.contact?.email || `care@${subdomain}.com` },
                  { icon: MapPin, label: 'Location', value: tenantInfo?.contact?.city || 'Healthcare District' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 md:gap-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white">
                      <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">{item.label}</p>
                      <p className="text-base md:text-lg font-bold text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px]">
              <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8">Direct Message</h3>
              <form className="space-y-4 md:space-y-6">
                <input placeholder="Your Name" className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl focus:outline-none focus:border-medi-green border border-slate-100 font-bold text-sm md:text-base" />
                <textarea rows={3} placeholder="Tell us what you need" className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl focus:outline-none focus:border-medi-green border border-slate-100 font-bold resize-none text-sm md:text-base" />
                <button className="w-full py-4 md:py-5 bg-medi-green text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:shadow-xl transition-all">Send Now</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-slate-400 font-bold text-xs uppercase tracking-widest">
          <div className="flex items-center gap-4 text-slate-950">
            {branding?.logo ? (
              <img src={branding.logo} alt={pharmacyName} className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 bg-medi-green rounded flex items-center justify-center text-white">
                {pharmacyName[0].toUpperCase()}
              </div>
            )}
            <span>{pharmacyName}</span>
          </div>
          <p className="text-center">© 2025 • Pharmaceutical Excellence</p>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <div className="w-6 h-6 bg-medi-green rounded flex items-center justify-center text-white font-black text-[8px]">MH</div>
            <span className="text-slate-950">MediHeal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
