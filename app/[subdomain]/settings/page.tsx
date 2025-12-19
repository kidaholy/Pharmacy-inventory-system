'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '../../../components/TenantLayout';
import { auth, User } from '../../../lib/auth';
import Link from 'next/link';
import {
    User as UserIcon,
    Building2,
    Bell,
    Shield,
    Palette,
    CreditCard,
    Key,
    Check,
    Globe,
    Image,
    Plus,
    Trash2,
    Eye,
    Sparkles,
    Star,
    Phone,
    ChevronRight,
    Save,
    Lock,
    Trash,
    CheckCircle
} from 'lucide-react';
import {
    CheckIcon,
    TrashIcon,
    KeyIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const ImageUploadZone = ({
    label,
    value,
    onChange,
    tenantId,
    aspectRatio = "video"
}: {
    label: string,
    value: string,
    onChange: (url: string) => void,
    tenantId: string,
    aspectRatio?: "video" | "square" | "portrait"
}) => {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`/api/tenant/${tenantId}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                onChange(data.url);
            } else {
                const errData = await response.json();
                setError(errData.error || 'Upload failed');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setUploading(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <div className="space-y-4">
            <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.3em] font-medium">{label}</label>
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`relative group cursor-pointer border border-slate-200 rounded-[32px] transition-all duration-300 overflow-hidden bg-slate-50 ${dragging ? 'border-medi-green/50 bg-medi-green/5 shadow-lg' : 'hover:border-medi-green/30'
                    } ${aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'square' ? 'aspect-square' : 'aspect-[3/4]'}`}
            >
                {value ? (
                    <>
                        <img src={value} alt={label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-md">
                            <div className="flex flex-col items-center text-white">
                                <Image className="w-10 h-10 mb-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Update Image</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        <div className={`w-16 h-16 rounded-[24px] mb-4 flex items-center justify-center transition-all ${dragging ? 'bg-medi-green text-white shadow-lg' : 'bg-slate-200 text-slate-400 group-hover:text-medi-green'}`}>
                            <Image className="w-8 h-8" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">Upload Image</p>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Tap or Drag to Proceed</p>
                    </div>
                )}

                <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                />

                {uploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xl flex items-center justify-center z-10">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 border-2 border-medi-green border-t-transparent rounded-full animate-spin mb-4"></div>
                            <span className="text-[10px] font-black text-medi-green uppercase tracking-[0.3em]">Uploading...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute bottom-6 left-6 right-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function SettingsPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        pharmacyName: '',
        address: '',
        city: '',
        country: '',
        image: ''
    });

    const [branding, setBranding] = useState({
        logo: '',
        heroTitle: '',
        heroSubtitle: '',
        heroImage: '',
        deliveryImage: '',
        consultationImage: '',
        contactMessage: '',
        businessHours: ''
    });

    const [cmsData, setCmsData] = useState<{
        hero: { title: string, subtitle: string, image: string },
        services: Array<{ title: string, description: string, image: string, icon?: string }>,
        faq: Array<{ question: string, answer: string }>,
        contact: { message: string, businessHours?: string }
    }>({
        hero: { title: '', subtitle: '', image: '' },
        services: [],
        faq: [],
        contact: { message: '', businessHours: '' }
    });

    useEffect(() => {
        const currentUser = auth.requireAuth();
        if (currentUser) {
            setUser(currentUser);
            setFormData(prev => ({
                ...prev,
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                email: currentUser.email || '',
                image: currentUser.image || ''
            }));
            loadData();
        }
    }, []);

    const loadData = async () => {
        try {
            const [tenantRes, cmsRes] = await Promise.all([
                fetch(`/api/tenant/${subdomain}`),
                fetch(`/api/tenant/${subdomain}/cms`)
            ]);

            if (tenantRes.ok) {
                const data = await tenantRes.json();
                setFormData(prev => ({
                    ...prev,
                    pharmacyName: data.name || '',
                    email: data.contact?.email || '',
                    phone: data.contact?.phone || '',
                    city: data.contact?.city || '',
                    country: data.contact?.country || '',
                }));
                if (data.settings?.branding) {
                    setBranding(prev => ({ ...prev, ...data.settings.branding }));
                }
            }

            if (cmsRes.ok) {
                const data = await cmsRes.json();
                setCmsData(data);
                // Sync legacy branding into CMS data if CMS is empty
                if (!data.hero?.title && branding.heroTitle) {
                    setCmsData(prev => ({
                        ...prev,
                        hero: { title: branding.heroTitle, subtitle: branding.heroSubtitle, image: branding.heroImage },
                        contact: { message: branding.contactMessage, businessHours: branding.businessHours }
                    }));
                }
            }
        } catch (err) {
            console.error('Error loading data:', err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            let updatePayload: any = {};
            let isCmsUpdate = false;

            if (activeTab === 'profile') {
                if (!user) return;
                updatePayload = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    image: formData.image,
                    tenantId: user.tenantId // Backend requirement
                };

                const response = await fetch(`/api/users/${user._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatePayload)
                });

                if (response.ok) {
                    auth.updateSessionUser({
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        image: formData.image
                    });
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                } else {
                    const errData = await response.json();
                    setError(errData.error || 'Failed to update profile');
                }
                return; // Early return for profile save
            } else if (activeTab === 'pharmacy') {
                updatePayload = {
                    name: formData.pharmacyName,
                    contact: {
                        email: formData.email,
                        phone: formData.phone,
                        city: formData.city,
                        country: formData.country
                    }
                };
            } else if (activeTab === 'website') {
                isCmsUpdate = true;
                updatePayload = cmsData;
                // Also update legacy branding for compatibility
                await fetch(`/api/tenant/${subdomain}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        settings: {
                            branding: {
                                logo: branding.logo,
                                heroTitle: cmsData.hero.title,
                                heroSubtitle: cmsData.hero.subtitle,
                                heroImage: cmsData.hero.image,
                                contactMessage: cmsData.contact.message,
                                businessHours: cmsData.contact.businessHours
                            }
                        }
                    })
                });
            }

            const url = isCmsUpdate ? `/api/tenant/${subdomain}/cms` : `/api/tenant/${subdomain}`;
            const response = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });

            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } else {
                const errData = await response.json();
                setError(errData.error || 'Failed to save changes');
            }
        } catch (err) {
            setError('An error occurred while saving');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', name: 'Profile', icon: UserIcon },
        { id: 'pharmacy', name: 'Pharmacy Info', icon: Building2 },
        { id: 'website', name: 'Website CMS', icon: Globe },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'appearance', name: 'Appearance', icon: Palette },
        { id: 'billing', name: 'Billing', icon: CreditCard },
    ];

    return (
        <TenantLayout title="Settings" subtitle="Manage your account and preferences">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-72 flex-shrink-0">
                    <div className="bg-white rounded-[40px] border border-slate-100 p-4 space-y-2 sticky top-[100px] shadow-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between px-6 py-4 rounded-[24px] transition-all group ${activeTab === tab.id
                                    ? 'bg-medi-green text-white font-black shadow-lg shadow-medi-green/20'
                                    : 'text-slate-400 hover:text-medi-green hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <tab.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-white' : 'text-slate-300 group-hover:text-medi-green'}`} />
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-black">{tab.name}</span>
                                </div>
                                {activeTab === tab.id && <ChevronRight className="w-4 h-4 text-white" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1">
                    {error && (
                        <div className="mb-8 p-5 bg-red-500/10 text-red-500 rounded-[32px] border border-red-500/20 flex items-center gap-4 font-black uppercase tracking-widest text-[10px] animate-pulse">
                            <Lock className="w-5 h-5" />
                            <span>System Override: {error}</span>
                        </div>
                    )}

                    <div className="bg-white rounded-[48px] border border-slate-100 p-12 shadow-sm">
                        {activeTab === 'profile' && (
                            <div className="space-y-12">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Your Profile</h3>
                                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
                                        <UserIcon className="w-6 h-6 text-medi-green" />
                                    </div>
                                </div>
                                <div className="space-y-10">
                                    <ImageUploadZone
                                        label="Profile Picture"
                                        value={formData.image}
                                        onChange={(url) => setFormData({ ...formData, image: url })}
                                        tenantId={user?.tenantId || 'general'}
                                        aspectRatio="square"
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {[
                                            { label: 'First Name', value: formData.firstName, field: 'firstName', type: 'text' },
                                            { label: 'Last Name', value: formData.lastName, field: 'lastName', type: 'text' },
                                            { label: 'Email Address', value: formData.email, field: 'email', type: 'email' },
                                            { label: 'Phone Number', value: formData.phone, field: 'phone', type: 'tel' }
                                        ].map((field) => (
                                            <div key={field.field} className="space-y-3">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{field.label}</label>
                                                <input
                                                    type={field.type}
                                                    value={field.value}
                                                    onChange={(e) => setFormData({ ...formData, [field.field]: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all shadow-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pharmacy' && (
                            <div className="space-y-12">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Pharmacy Details</h3>
                                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-medi-green" />
                                    </div>
                                </div>
                                <div className="space-y-10">
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Pharmacy Name</label>
                                        <input
                                            type="text"
                                            value={formData.pharmacyName}
                                            onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold text-xl transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Physical Address</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows={3}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">City</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">G-Country</label>
                                            <input
                                                type="text"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                className="w-full px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:outline-none focus:border-[#F9E076]/30 text-white font-bold transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'website' && (
                            <div className="space-y-20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Website CMS</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Manage your public pharmacy website</p>
                                    </div>
                                    <Link
                                        href={`/${subdomain}`}
                                        target="_blank"
                                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black uppercase tracking-widest text-[10px] shadow-lg"
                                    >
                                        <Eye className="w-5 h-5" />
                                        View Live Site
                                    </Link>
                                </div>

                                {/* Logo & Core Identity */}
                                <section className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 relative overflow-hidden shadow-sm">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 bg-medi-green rounded-[20px] flex items-center justify-center text-white shadow-lg">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs text-slate-900 uppercase tracking-[0.3em]">Brand Identity</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pharmacy Logos & Icons</p>
                                        </div>
                                    </div>
                                    <div className="max-w-xs">
                                        <ImageUploadZone
                                            label="Pharmacy Logo"
                                            value={branding.logo}
                                            onChange={(url) => setBranding({ ...branding, logo: url })}
                                            tenantId={subdomain}
                                            aspectRatio="square"
                                        />
                                    </div>
                                </section>

                                {/* Hero Content Manager */}
                                <section className="p-10 bg-medi-green/5 rounded-[48px] border border-medi-green/10 relative shadow-sm">
                                    <div className="flex items-center gap-4 mb-12">
                                        <div className="w-12 h-12 bg-medi-green rounded-[20px] flex items-center justify-center text-white shadow-lg">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs text-slate-900 uppercase tracking-[0.3em]">Hero Section</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Main Landing Page Intro</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Main Headline</label>
                                                <input
                                                    type="text"
                                                    value={cmsData.hero.title}
                                                    onChange={(e) => setCmsData({ ...cmsData, hero: { ...cmsData.hero, title: e.target.value } })}
                                                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-medi-green/30 outline-none font-black text-2xl text-slate-900 tracking-tighter shadow-sm"
                                                    placeholder="Pharmacy perfected."
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sub-headline / Description</label>
                                                <textarea
                                                    value={cmsData.hero.subtitle}
                                                    onChange={(e) => setCmsData({ ...cmsData, hero: { ...cmsData.hero, subtitle: e.target.value } })}
                                                    rows={4}
                                                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-medi-green/30 outline-none text-slate-600 font-medium leading-relaxed shadow-sm"
                                                    placeholder="Tell your story..."
                                                />
                                            </div>
                                        </div>
                                        <ImageUploadZone
                                            label="Hero Image"
                                            value={cmsData.hero.image}
                                            onChange={(url) => setCmsData({ ...cmsData, hero: { ...cmsData.hero, image: url } })}
                                            tenantId={subdomain}
                                            aspectRatio="video"
                                        />
                                    </div>
                                </section>

                                {/* Service Grid Manager */}
                                <section className="space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-medi-green rounded-[20px] flex items-center justify-center text-white shadow-lg">
                                                <Building2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-xs text-slate-900 uppercase tracking-[0.3em]">Services</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">What your pharmacy offers</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setCmsData({ ...cmsData, services: [...cmsData.services, { title: 'New Service', description: '', image: '' }] })}
                                            className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                                        >
                                            Add Service
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {cmsData.services.map((s, idx) => (
                                            <div key={idx} className="bg-white p-8 rounded-[40px] border border-slate-100 relative group shadow-sm hover:shadow-md transition-all">
                                                <button
                                                    onClick={() => setCmsData({ ...cmsData, services: cmsData.services.filter((_, i) => i !== idx) })}
                                                    className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <div className="space-y-6">
                                                    <input
                                                        value={s.title}
                                                        onChange={(e) => {
                                                            const news = [...cmsData.services];
                                                            news[idx].title = e.target.value;
                                                            setCmsData({ ...cmsData, services: news });
                                                        }}
                                                        className="w-full text-xl font-black tracking-tight outline-none border-b border-slate-100 focus:border-medi-green/30 bg-transparent text-slate-900"
                                                        placeholder="Service Title"
                                                    />
                                                    <textarea
                                                        value={s.description}
                                                        onChange={(e) => {
                                                            const news = [...cmsData.services];
                                                            news[idx].description = e.target.value;
                                                            setCmsData({ ...cmsData, services: news });
                                                        }}
                                                        className="w-full text-sm font-medium text-slate-600 outline-none bg-slate-50 p-5 rounded-2xl min-h-[100px]"
                                                        placeholder="Description..."
                                                    />
                                                    <ImageUploadZone
                                                        label="Service Image"
                                                        value={s.image}
                                                        onChange={(url) => {
                                                            const news = [...cmsData.services];
                                                            news[idx].image = url;
                                                            setCmsData({ ...cmsData, services: news });
                                                        }}
                                                        tenantId={subdomain}
                                                        aspectRatio="video"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* FAQ Manager */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-medi-green rounded-xl flex items-center justify-center text-white shadow-lg">
                                                <CheckIcon className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-black text-lg text-slate-900 uppercase tracking-widest">Customer FAQ</h4>
                                        </div>
                                        <button
                                            onClick={() => setCmsData({ ...cmsData, faq: [...cmsData.faq, { question: '', answer: '' }] })}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md"
                                        >
                                            Add Question
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {cmsData.faq.map((f, idx) => (
                                            <div key={idx} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-3 relative group">
                                                <button
                                                    onClick={() => setCmsData({ ...cmsData, faq: cmsData.faq.filter((_, i) => i !== idx) })}
                                                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                                <input
                                                    value={f.question}
                                                    onChange={(e) => {
                                                        const newfaq = [...cmsData.faq];
                                                        newfaq[idx].question = e.target.value;
                                                        setCmsData({ ...cmsData, faq: newfaq });
                                                    }}
                                                    className="w-full font-black text-slate-900 outline-none pr-10"
                                                    placeholder="The Question?"
                                                />
                                                <textarea
                                                    value={f.answer}
                                                    onChange={(e) => {
                                                        const newfaq = [...cmsData.faq];
                                                        newfaq[idx].answer = e.target.value;
                                                        setCmsData({ ...cmsData, faq: newfaq });
                                                    }}
                                                    className="w-full text-sm font-medium text-slate-500 outline-none bg-slate-50 p-4 rounded-2xl"
                                                    placeholder="The Answer content..."
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Support Area */}
                                <section className="p-10 bg-medi-green rounded-[48px] text-white shadow-xl shadow-medi-green/20">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 bg-white/10 rounded-[20px] flex items-center justify-center text-white">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-[0.3em]">Contact Support Info</h4>
                                            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1">Pharmacy connectivity</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Contact Message</label>
                                            <input
                                                type="text"
                                                value={cmsData.contact.message}
                                                onChange={(e) => setCmsData({ ...cmsData, contact: { ...cmsData.contact, message: e.target.value } })}
                                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-white/20 outline-none font-black text-lg placeholder:text-white/20"
                                                placeholder="Get In Touch."
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Business Hours</label>
                                            <input
                                                type="text"
                                                value={cmsData.contact.businessHours}
                                                onChange={(e) => setCmsData({ ...cmsData, contact: { ...cmsData.contact, businessHours: e.target.value } })}
                                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-white/20 outline-none font-black text-lg placeholder:text-white/20"
                                                placeholder="Mon - Sat: 8AM - 8PM"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Notifications, Security, Appearance, Billing tabs excluded from CMS implementation for now */}
                        {activeTab === 'notifications' && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Notification Preferences</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Low Stock Alerts', desc: 'Get notified when products are running low' },
                                        { name: 'Expiry Alerts', desc: 'Notifications for products expiring soon' },
                                        { name: 'Order Updates', desc: 'Status updates for purchase orders' },
                                        { name: 'Sales Reports', desc: 'Daily/weekly sales summary' },
                                        { name: 'System Updates', desc: 'New features and maintenance notices' },
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <p className="font-medium text-slate-900">{item.name}</p>
                                                <p className="text-sm text-slate-500">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-medi-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medi-green"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Security Settings</h3>
                                <div className="space-y-6">
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <KeyIcon className="w-6 h-6 text-slate-600" />
                                                <div>
                                                    <p className="font-medium text-slate-900">Change Password</p>
                                                    <p className="text-sm text-slate-500">Update your password regularly</p>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheckIcon className="w-6 h-6 text-slate-600" />
                                                <div>
                                                    <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                                                    <p className="text-sm text-slate-500">Add an extra layer of security</p>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 bg-medi-green text-white rounded-xl text-sm font-medium hover:bg-medi-green/90 transition-colors" disabled>
                                                Enable
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Appearance</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-4">Theme</label>
                                        <div className="flex gap-4">
                                            <button className="flex-1 p-4 bg-white border-2 border-medi-green rounded-xl text-center">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg mx-auto mb-2"></div>
                                                <p className="font-medium text-slate-900">Light</p>
                                            </button>
                                            <button className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center hover:border-slate-300 transition-colors">
                                                <div className="w-8 h-8 bg-slate-800 rounded-lg mx-auto mb-2"></div>
                                                <p className="font-medium text-slate-900">Dark</p>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'billing' && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Billing & Subscription</h3>
                                <div className="p-6 bg-medi-green/5 border border-medi-green/20 rounded-2xl mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="px-3 py-1 bg-medi-green text-white text-xs font-bold rounded-full">PRO PLAN</span>
                                            <h4 className="text-xl font-bold text-slate-900 mt-2">$29/month</h4>
                                            <p className="text-sm text-slate-600">Next billing date: Jan 19, 2025</p>
                                        </div>
                                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                                            Manage Subscription
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        {(activeTab === 'profile' || activeTab === 'pharmacy' || activeTab === 'website') && (
                            <div className="mt-16 pt-10 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`flex items-center gap-3 px-10 py-5 rounded-[24px] transition-all font-black uppercase tracking-widest text-xs shadow-lg hover:scale-[1.03] disabled:opacity-50 ${saved ? 'bg-emerald-500 text-white' : 'bg-medi-green text-white'
                                        }`}
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : saved ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    <span>{saved ? 'Changes Saved' : 'Commit Changes'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TenantLayout >
    );
}
