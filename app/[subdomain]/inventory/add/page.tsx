'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TenantLayout from '../../../../components/TenantLayout';
import {
    Save,
    ArrowLeft,
    Package,
    AlertTriangle,
    Calendar,
    DollarSign,
    Building,
    Hash,
    FileText,
    Pill,
    Factory
} from 'lucide-react';
import Link from 'next/link';

export default function AddMedicinePage() {
    const params = useParams();
    const router = useRouter();
    const subdomain = params.subdomain as string;

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Array<{ _id: string; name: string; color?: string }>>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        genericName: '',
        category: '',
        manufacturer: '',
        price: '',
        quantity: '',
        expiryDate: '',
        batchNumber: '',
        reorderLevel: '',
        description: '',
        dosage: '',
        strength: ''
    });

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const response = await fetch(`/api/tenant/${subdomain}/categories`);
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data.categories || []);
                } else {
                    console.error('Failed to fetch categories');
                    setCategories([]);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setCategories([]);
            } finally {
                setLoadingCategories(false);
            }
        };

        if (subdomain) {
            fetchCategories();
        }
    }, [subdomain]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.category || !formData.price || !formData.quantity) {
            setError('Please fill in all required fields');
            return;
        }

        if (!formData.category) {
            setError('Please select a category for this medicine');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const response = await fetch(`/api/tenant/${subdomain}/medicines`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    quantity: parseInt(formData.quantity),
                    reorderLevel: parseInt(formData.reorderLevel) || 10,
                }),
            });

            if (response.ok) {
                router.push(`/${subdomain}/inventory`);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to add medicine');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <TenantLayout title="Add Medicine" subtitle="Add new medicine to inventory">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/${subdomain}/inventory`}>
                        <button className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase">Add New Medicine</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Expand your inventory catalog</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-[24px] lg:rounded-[32px] border border-slate-100 p-6 lg:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-medi-green/10 rounded-xl flex items-center justify-center">
                                <Pill className="w-5 h-5 text-medi-green" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Medicine Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all"
                                    placeholder="e.g., Paracetamol 500mg"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Generic Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.genericName}
                                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all"
                                    placeholder="e.g., Acetaminophen"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Category *
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all appearance-none cursor-pointer"
                                    disabled={loadingCategories}
                                >
                                    <option value="">
                                        {loadingCategories ? 'Loading categories...' : categories.length === 0 ? 'No categories available' : 'Select Category'}
                                    </option>
                                    {categories.map(category => (
                                        <option key={category._id} value={category.name}>{category.name}</option>
                                    ))}
                                </select>
                                {!loadingCategories && categories.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3" />
                                        No categories found. Please create categories first.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Manufacturer
                                </label>
                                <input
                                    type="text"
                                    value={formData.manufacturer}
                                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all"
                                    placeholder="e.g., PharmaCorp Ltd"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Dosage/Strength
                                </label>
                                <input
                                    type="text"
                                    value={formData.strength}
                                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all"
                                    placeholder="e.g., 500mg, 10ml"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all resize-none"
                                    placeholder="Brief description of the medicine..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stock & Pricing */}
                    <div className="bg-white rounded-[24px] lg:rounded-[32px] border border-slate-100 p-6 lg:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-medi-green/10 rounded-xl flex items-center justify-center">
                                <Package className="w-5 h-5 text-medi-green" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">Stock & Pricing</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Initial Quantity *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all"
                                    placeholder="100"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Reorder Level
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.reorderLevel}
                                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all"
                                    placeholder="10"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Unit Price *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all"
                                    placeholder="25.50"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Expiry Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Batch & Supplier Information */}
                    <div className="bg-white rounded-[24px] lg:rounded-[32px] border border-slate-100 p-6 lg:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-medi-green/10 rounded-xl flex items-center justify-center">
                                <Factory className="w-5 h-5 text-medi-green" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">Batch & Supplier</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Batch Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.batchNumber}
                                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all"
                                    placeholder="e.g., BT2024001"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Dosage Form
                                </label>
                                <select
                                    value={formData.dosage}
                                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Dosage Form</option>
                                    <option value="Tablet">Tablet</option>
                                    <option value="Capsule">Capsule</option>
                                    <option value="Syrup">Syrup</option>
                                    <option value="Injection">Injection</option>
                                    <option value="Cream">Cream</option>
                                    <option value="Ointment">Ointment</option>
                                    <option value="Drops">Drops</option>
                                    <option value="Inhaler">Inhaler</option>
                                    <option value="Patch">Patch</option>
                                    <option value="Suppository">Suppository</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8">
                        <Link href={`/${subdomain}/inventory`} className="flex-1 sm:flex-none">
                            <button
                                type="button"
                                className="w-full px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                            >
                                Cancel
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-medi-green text-white rounded-xl font-black hover:scale-[1.03] transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Adding Medicine...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Add Medicine
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </TenantLayout>
    );
}