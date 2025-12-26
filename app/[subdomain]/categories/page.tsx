'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TenantLayout from '../../../components/TenantLayout';
import {
    Plus,
    Edit2,
    Trash2,
    X,
    Save,
    Tag,
    Palette
} from 'lucide-react';

interface Category {
    _id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive: boolean;
    createdAt: string;
}

export default function CategoriesPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#10b981'
    });

    const predefinedColors = [
        { name: 'Green', value: '#10b981' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Purple', value: '#8b5cf6' },
        { name: 'Orange', value: '#f59e0b' },
        { name: 'Pink', value: '#ec4899' },
        { name: 'Teal', value: '#14b8a6' },
        { name: 'Indigo', value: '#6366f1' }
    ];

    useEffect(() => {
        fetchCategories();
    }, [subdomain]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/tenant/${subdomain}/categories`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingCategory
            ? `/api/tenant/${subdomain}/categories/${editingCategory._id}`
            : `/api/tenant/${subdomain}/categories`;

        const method = editingCategory ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchCategories();
                setShowModal(false);
                setEditingCategory(null);
                setFormData({ name: '', description: '', color: '#10b981' });
            }
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            color: category.color || '#10b981'
        });
        setShowModal(true);
    };

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const response = await fetch(`/api/tenant/${subdomain}/categories/${categoryId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchCategories();
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', color: '#10b981' });
    };

    return (
        <TenantLayout title="Categories" subtitle="Manage medicine categories">
            <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            Medicine Categories
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">
                            Organize your inventory
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-medi-green text-white rounded-xl font-black hover:scale-[1.03] transition-all shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Add Category
                    </button>
                </div>

                {/* Categories Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-medi-green border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-[24px] border border-slate-100">
                        <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Categories Yet</h3>
                        <p className="text-slate-500 mb-6">Create your first category to organize medicines</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-medi-green text-white rounded-xl font-bold hover:scale-[1.03] transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Category
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <div
                                key={category._id}
                                className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${category.color}20` }}
                                    >
                                        <Tag className="w-6 h-6" style={{ color: category.color }} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4 text-slate-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category._id)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2">{category.name}</h3>
                                {category.description && (
                                    <p className="text-sm text-slate-500">{category.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-[24px] max-w-md w-full p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-slate-900">
                                    {editingCategory ? 'Edit Category' : 'New Category'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold"
                                        placeholder="e.g., Pain Relief"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-medi-green/30 text-slate-900 font-bold resize-none"
                                        placeholder="Brief description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">
                                        Color
                                    </label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {predefinedColors.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color: color.value })}
                                                className={`h-12 rounded-xl border-2 transition-all ${formData.color === color.value
                                                        ? 'border-slate-900 scale-110'
                                                        : 'border-slate-200 hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-medi-green text-white rounded-xl font-bold hover:scale-[1.03] transition-all"
                                    >
                                        <Save className="w-5 h-5" />
                                        {editingCategory ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </TenantLayout>
    );
}
