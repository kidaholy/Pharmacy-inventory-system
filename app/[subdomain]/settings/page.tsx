'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '../../../components/TenantLayout';
import { auth, User } from '../../../lib/auth';
import Link from 'next/link';
import {
    UserIcon,
    BuildingStorefrontIcon,
    BellIcon,
    ShieldCheckIcon,
    PaintBrushIcon,
    CreditCardIcon,
    KeyIcon,
    CheckIcon,
    GlobeAltIcon,
    PhotoIcon,
    PlusIcon,
    TrashIcon,
    EyeIcon,
    SparklesIcon,
    StarIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const currentUser = auth.requireAuth();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        pharmacyName: '',
        address: '',
        city: '',
        country: '',
    });

    // CMS Data for Landing Page
    const [cmsData, setCmsData] = useState({
        tagline: 'Your Trusted Healthcare Partner',
        description: 'Your neighborhood pharmacy committed to providing quality healthcare products and personalized service for you and your family.',
        businessHours: 'Mon - Sat: 8AM - 8PM',
        services: [
            { title: 'Quality Medicines', description: 'Wide range of authenticated pharmaceutical products' },
            { title: 'Health Consultation', description: 'Expert pharmacists available for health advice' },
            { title: 'Fast Delivery', description: 'Quick and reliable medicine delivery service' },
            { title: 'Secure & Safe', description: '100% genuine products with quality guarantee' },
        ],
        testimonials: [
            { name: 'Sarah M.', text: 'Excellent service and genuine medicines!', rating: 5 },
            { name: 'John D.', text: 'Fast delivery and great prices.', rating: 5 },
            { name: 'Emily R.', text: 'Very professional staff.', rating: 4 },
        ],
        stats: [
            { value: '10K+', label: 'Happy Customers' },
            { value: '500+', label: 'Products Available' },
            { value: '24/7', label: 'Support Available' },
            { value: '99%', label: 'Satisfaction Rate' },
        ],
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: '',
                pharmacyName: '',
                address: '',
                city: '',
                country: '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const addService = () => {
        setCmsData({
            ...cmsData,
            services: [...cmsData.services, { title: 'New Service', description: 'Service description' }]
        });
    };

    const removeService = (index: number) => {
        setCmsData({
            ...cmsData,
            services: cmsData.services.filter((_, i) => i !== index)
        });
    };

    const updateService = (index: number, field: 'title' | 'description', value: string) => {
        const newServices = [...cmsData.services];
        newServices[index][field] = value;
        setCmsData({ ...cmsData, services: newServices });
    };

    const addTestimonial = () => {
        setCmsData({
            ...cmsData,
            testimonials: [...cmsData.testimonials, { name: 'Customer Name', text: 'Their feedback...', rating: 5 }]
        });
    };

    const removeTestimonial = (index: number) => {
        setCmsData({
            ...cmsData,
            testimonials: cmsData.testimonials.filter((_, i) => i !== index)
        });
    };

    const updateTestimonial = (index: number, field: 'name' | 'text' | 'rating', value: string | number) => {
        const newTestimonials = [...cmsData.testimonials];
        (newTestimonials[index] as any)[field] = value;
        setCmsData({ ...cmsData, testimonials: newTestimonials });
    };

    const updateStat = (index: number, field: 'value' | 'label', value: string) => {
        const newStats = [...cmsData.stats];
        newStats[index][field] = value;
        setCmsData({ ...cmsData, stats: newStats });
    };

    const tabs = [
        { id: 'profile', name: 'Profile', icon: UserIcon },
        { id: 'pharmacy', name: 'Pharmacy', icon: BuildingStorefrontIcon },
        { id: 'website', name: 'Website CMS', icon: GlobeAltIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'security', name: 'Security', icon: ShieldCheckIcon },
        { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
        { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    ];

    return (
        <TenantLayout title="Settings" subtitle="Manage your account and preferences">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id
                                    ? 'bg-medi-green/10 text-medi-green font-semibold'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        {activeTab === 'profile' && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Profile Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pharmacy' && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Pharmacy Information</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Pharmacy Name</label>
                                        <input
                                            type="text"
                                            value={formData.pharmacyName}
                                            onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                                            <input
                                                type="text"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Website CMS Tab */}
                        {activeTab === 'website' && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Website CMS</h3>
                                        <p className="text-sm text-slate-500">Customize your public landing page</p>
                                    </div>
                                    <Link
                                        href={`/${subdomain}`}
                                        target="_blank"
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-700 hover:bg-slate-200 transition-colors"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                        Preview Site
                                    </Link>
                                </div>

                                {/* Hero Section */}
                                <div className="p-6 bg-gradient-to-r from-medi-green/5 to-medi-lime/5 rounded-2xl border border-medi-green/10">
                                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5 text-medi-green" />
                                        Hero Section
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Tagline</label>
                                            <input
                                                type="text"
                                                value={cmsData.tagline}
                                                onChange={(e) => setCmsData({ ...cmsData, tagline: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                                                placeholder="Your Trusted Healthcare Partner"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                            <textarea
                                                value={cmsData.description}
                                                onChange={(e) => setCmsData({ ...cmsData, description: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                                                placeholder="Your pharmacy description..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Business Hours</label>
                                            <input
                                                type="text"
                                                value={cmsData.businessHours}
                                                onChange={(e) => setCmsData({ ...cmsData, businessHours: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/30 focus:border-medi-green"
                                                placeholder="Mon - Sat: 8AM - 8PM"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Section */}
                                <div className="p-6 bg-slate-50 rounded-2xl">
                                    <h4 className="font-semibold text-slate-900 mb-4">Statistics</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {cmsData.stats.map((stat, index) => (
                                            <div key={index} className="bg-white p-4 rounded-xl border border-slate-200">
                                                <input
                                                    type="text"
                                                    value={stat.value}
                                                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                                                    className="w-full text-xl font-bold text-medi-green mb-1 bg-transparent focus:outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    value={stat.label}
                                                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                                                    className="w-full text-sm text-slate-500 bg-transparent focus:outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Services Section */}
                                <div className="p-6 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-slate-900">Services</h4>
                                        <button
                                            onClick={addService}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-medi-green text-white rounded-lg text-sm font-medium hover:bg-medi-green/90 transition-colors"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Add Service
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {cmsData.services.map((service, index) => (
                                            <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 group">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <input
                                                            type="text"
                                                            value={service.title}
                                                            onChange={(e) => updateService(index, 'title', e.target.value)}
                                                            className="w-full font-semibold text-slate-900 bg-transparent focus:outline-none focus:bg-slate-50 rounded px-2 py-1 -mx-2"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={service.description}
                                                            onChange={(e) => updateService(index, 'description', e.target.value)}
                                                            className="w-full text-sm text-slate-500 bg-transparent focus:outline-none focus:bg-slate-50 rounded px-2 py-1 -mx-2"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeService(index)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Testimonials Section */}
                                <div className="p-6 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-slate-900">Customer Testimonials</h4>
                                        <button
                                            onClick={addTestimonial}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-medi-green text-white rounded-lg text-sm font-medium hover:bg-medi-green/90 transition-colors"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Add Testimonial
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {cmsData.testimonials.map((testimonial, index) => (
                                            <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 group">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="text"
                                                                value={testimonial.name}
                                                                onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                                                                className="font-semibold text-slate-900 bg-transparent focus:outline-none focus:bg-slate-50 rounded px-2 py-1"
                                                                placeholder="Customer name"
                                                            />
                                                            <div className="flex items-center gap-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <button
                                                                        key={star}
                                                                        onClick={() => updateTestimonial(index, 'rating', star)}
                                                                        className={`${star <= testimonial.rating ? 'text-amber-400' : 'text-slate-300'}`}
                                                                    >
                                                                        <StarIcon className="w-4 h-4 fill-current" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            value={testimonial.text}
                                                            onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                                                            className="w-full text-sm text-slate-600 bg-transparent focus:outline-none focus:bg-slate-50 rounded px-2 py-1 resize-none"
                                                            rows={2}
                                                            placeholder="Their feedback..."
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeTestimonial(index)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

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
                                            <button className="px-4 py-2 bg-medi-green text-white rounded-xl text-sm font-medium hover:bg-medi-green/90 transition-colors">
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
                                            <button className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center hover:border-slate-300 transition-colors">
                                                <div className="w-8 h-8 bg-gradient-to-b from-slate-100 to-slate-800 rounded-lg mx-auto mb-2"></div>
                                                <p className="font-medium text-slate-900">System</p>
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
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-slate-900">Payment History</h4>
                                    {[
                                        { date: 'Dec 19, 2024', amount: '$29.00', status: 'Paid' },
                                        { date: 'Nov 19, 2024', amount: '$29.00', status: 'Paid' },
                                        { date: 'Oct 19, 2024', amount: '$29.00', status: 'Paid' },
                                    ].map((payment, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <span className="text-slate-600">{payment.date}</span>
                                            <span className="font-medium text-slate-900">{payment.amount}</span>
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">{payment.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        {(activeTab === 'profile' || activeTab === 'pharmacy' || activeTab === 'website') && (
                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-medi-green text-white rounded-xl hover:bg-medi-green/90 transition-colors shadow-lg shadow-medi-green/20 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : saved ? (
                                        <CheckIcon className="w-5 h-5" />
                                    ) : null}
                                    <span className="font-semibold">{saved ? 'Saved!' : 'Save Changes'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TenantLayout>
    );
}
