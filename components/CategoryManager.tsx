'use client';

import React, { useState, useEffect } from 'react';

interface Category {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
}

interface CategoryManagerProps {
    selectedCategory?: string;
    onCategorySelect: (category: string) => void;
    subdomain: string;
    showSearch?: boolean;
    allowManagement?: boolean;
}

export default function CategoryManager({ 
    selectedCategory = '', 
    onCategorySelect, 
    subdomain,
    showSearch = true,
    allowManagement = true
}: CategoryManagerProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [error, setError] = useState('');

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/tenant/${subdomain}/categories`);
            const data = await response.json();
            
            if (data.success) {
                setCategories(data.categories);
            } else {
                setError(data.error || 'Failed to fetch categories');
            }
        } catch (error) {
            setError('Failed to fetch categories');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [subdomain]);

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCategoryClick = (categoryName: string) => {
        onCategorySelect(categoryName);
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            const response = await fetch(`/api/tenant/${subdomain}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCategoryName.trim(),
                    description: newCategoryDescription.trim()
                })
            });

            const data = await response.json();

            if (data.success) {
                setCategories(prev => [...prev, data.category]);
                setNewCategoryName('');
                setNewCategoryDescription('');
                setShowAddForm(false);
                setError('');
            } else {
                setError(data.error || 'Failed to create category');
            }
        } catch (error) {
            setError('Failed to create category');
        }
    };

    const handleEditCategory = async () => {
        if (!editingCategory || !newCategoryName.trim()) return;

        try {
            const response = await fetch(`/api/tenant/${subdomain}/categories/${editingCategory._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCategoryName.trim(),
                    description: newCategoryDescription.trim()
                })
            });

            const data = await response.json();

            if (data.success) {
                setCategories(prev => prev.map(cat => 
                    cat._id === editingCategory._id ? data.category : cat
                ));
                setEditingCategory(null);
                setNewCategoryName('');
                setNewCategoryDescription('');
                setError('');
            } else {
                setError(data.error || 'Failed to update category');
            }
        } catch (error) {
            setError('Failed to update category');
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const response = await fetch(`/api/tenant/${subdomain}/categories/${categoryId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setCategories(prev => prev.filter(cat => cat._id !== categoryId));
                setError('');
            } else {
                setError(data.error || 'Failed to delete category');
            }
        } catch (error) {
            setError('Failed to delete category');
        }
    };

    const startEdit = (category: Category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
        setNewCategoryDescription(category.description || '');
        setShowAddForm(true);
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        setNewCategoryName('');
        setNewCategoryDescription('');
        setShowAddForm(false);
        setError('');
    };

    return (
        <div className="relative w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicine Category
            </label>
            
            {/* Selected Category Display / Dropdown Trigger */}
            <div 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <div className="flex justify-between items-center">
                    <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
                        {selectedCategory || 'Select a category...'}
                    </span>
                    <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-auto">
                    {/* Search Input */}
                    {showSearch && (
                        <div className="p-2 border-b border-gray-200">
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}

                    {/* Add Category Button */}
                    {allowManagement && (
                        <div className="p-2 border-b border-gray-200">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAddForm(true);
                                }}
                                className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md border border-blue-300 hover:border-blue-400"
                            >
                                + Add New Category
                            </button>
                        </div>
                    )}
                    
                    {/* Category List */}
                    <div className="py-1">
                        {isLoading ? (
                            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                        ) : filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                                <div
                                    key={category._id}
                                    className={`group px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm flex justify-between items-center ${
                                        selectedCategory === category.name 
                                            ? 'bg-blue-50 text-blue-700 font-medium' 
                                            : 'text-gray-900'
                                    }`}
                                >
                                    <div onClick={() => handleCategoryClick(category.name)} className="flex-1">
                                        <div className="font-medium">{category.name}</div>
                                        {category.description && (
                                            <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                                        )}
                                    </div>
                                    {allowManagement && (
                                        <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEdit(category);
                                                }}
                                                className="p-1 text-gray-400 hover:text-blue-600"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCategory(category._id);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                                No categories found
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Add/Edit Category Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-medium mb-4">
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </h3>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter category name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Optional description"
                                    rows={3}
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={cancelEdit}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editingCategory ? handleEditCategory : handleAddCategory}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                {editingCategory ? 'Update' : 'Add'} Category
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Click outside to close */}
            {isDropdownOpen && (
                <div 
                    className="fixed inset-0 z-0" 
                    onClick={() => setIsDropdownOpen(false)}
                />
            )}
        </div>
    );
}