'use client';

import React, { useState, useEffect } from 'react';

interface Category {
    _id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    createdAt: string;
    updatedAt?: string;
}

interface AutoSaveCategoryFormProps {
    subdomain: string;
}

export default function AutoSaveCategoryForm({ subdomain }: AutoSaveCategoryFormProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#6b7280',
        icon: ''
    });
    
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Auto-load categories on component mount
    useEffect(() => {
        loadCategories();
    }, [subdomain]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`/api/tenant/${subdomain}/categories`);
            const data = await response.json();
            
            if (data.success) {
                setCategories(data.categories);
                setMessage(data.message || `✅ Auto-loaded ${data.categories.length} categories`);
            } else {
                setError(data.error || 'Failed to load categories');
            }
        } catch (err) {
            setError('Failed to connect to auto-save system');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            color: '#6b7280',
            icon: ''
        });
        setEditingCategory(null);
        setShowForm(false);
        setError('');
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setError('Category name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`/api/tenant/${subdomain}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMessage(data.message || '✅ Category auto-saved to MongoDB Atlas');
                resetForm();
                await loadCategories(); // Reload to show new category
            } else {
                setError(data.error || 'Auto-save CREATE failed');
            }
        } catch (err) {
            setError('Failed to auto-save category');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            color: category.color || '#6b7280',
            icon: category.icon || ''
        });
        setShowForm(true);
        setError('');
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingCategory || !formData.name.trim()) {
            setError('Category name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`/api/tenant/${subdomain}/categories/${editingCategory._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMessage(data.message || '✅ Category auto-updated in MongoDB Atlas');
                resetForm();
                await loadCategories(); // Reload to show updated category
            } else {
                setError(data.error || 'Auto-save UPDATE failed');
            }
        } catch (err) {
            setError('Failed to auto-update category');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId: string, categoryName: string) => {
        if (!confirm(`Are you sure you want to delete "${categoryName}"? This will auto-save the deletion to MongoDB Atlas.`)) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`/api/tenant/${subdomain}/categories/${categoryId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMessage(data.message || '✅ Category auto-deleted from MongoDB Atlas');
                await loadCategories(); // Reload to remove deleted category
            } else {
                setError(data.error || 'Auto-save DELETE failed');
            }
        } catch (err) {
            setError('Failed to auto-delete category');
        } finally {
            setLoading(false);
        }
    };

    const predefinedColors = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
        '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
        '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
        '#ec4899', '#f43f5e', '#6b7280', '#374151', '#111827'
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Auto-Save Category Manager
                </h2>
                <p className="text-gray-600">
                    All operations automatically save to MongoDB Atlas • Tenant: <span className="font-semibold">{subdomain}</span>
                </p>
            </div>

            {/* Status Messages */}
            {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
                    {message}
                </div>
            )}
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                    {error}
                </div>
            )}

            {/* Action Buttons */}
            <div className="mb-6 flex gap-3">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {showForm ? 'Hide Form' : 'Add New Category'}
                </button>
                
                <button
                    onClick={loadCategories}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh Categories'}
                </button>
            </div>

            {/* Category Form */}
            {showForm && (
                <form onSubmit={editingCategory ? handleUpdate : handleCreate} className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingCategory ? 'Edit Category (Auto-Update)' : 'Create Category (Auto-Save)'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter category name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Icon (optional)
                            </label>
                            <input
                                type="text"
                                name="icon"
                                value={formData.icon}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., pill, heart, etc."
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Optional description"
                            rows={3}
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {predefinedColors.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                                    className={`w-8 h-8 rounded-full border-2 ${
                                        formData.color === color ? 'border-gray-800' : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                        <input
                            type="color"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            className="w-16 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Auto-Saving...' : (editingCategory ? 'Auto-Update' : 'Auto-Save')}
                        </button>
                        
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Categories List */}
            <div>
                <h3 className="text-lg font-semibold mb-4">
                    Categories ({categories.length}) - Auto-Loaded from MongoDB Atlas
                </h3>
                
                {categories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No categories found. Create your first category above!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(category => (
                            <div
                                key={category._id}
                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: category.color || '#6b7280' }}
                                        />
                                        <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                    </div>
                                    {category.icon && (
                                        <span className="text-sm text-gray-500">{category.icon}</span>
                                    )}
                                </div>
                                
                                {category.description && (
                                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                                )}
                                
                                <div className="text-xs text-gray-400 mb-3">
                                    Created: {new Date(category.createdAt).toLocaleDateString()}
                                    {category.updatedAt && (
                                        <span> • Updated: {new Date(category.updatedAt).toLocaleDateString()}</span>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                        disabled={loading}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category._id, category.name)}
                                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                        disabled={loading}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}