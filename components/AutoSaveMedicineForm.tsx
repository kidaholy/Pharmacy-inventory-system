'use client';

import React, { useState, useEffect } from 'react';

interface Medicine {
    _id: string;
    name: string;
    genericName?: string;
    brandName?: string;
    category: string;
    subcategory?: string;
    description?: string;
    manufacturer?: string;
    supplier?: string;
    batchNumber?: string;
    price: number;
    quantity: number;
    reorderLevel: number;
    expiryDate: string;
    dosage?: string;
    strength?: string;
    form?: string;
    prescriptionRequired?: boolean;
    sideEffects?: string;
    contraindications?: string;
    storageConditions?: string;
    createdAt: string;
    updatedAt?: string;
}

interface Category {
    _id: string;
    name: string;
    description?: string;
    color?: string;
}

interface AutoSaveMedicineFormProps {
    subdomain: string;
}

export default function AutoSaveMedicineForm({ subdomain }: AutoSaveMedicineFormProps) {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    // Form states
    const [formData, setFormData] = useState({
        name: '',
        genericName: '',
        brandName: '',
        category: '',
        subcategory: '',
        description: '',
        manufacturer: '',
        supplier: '',
        batchNumber: '',
        price: '',
        quantity: '',
        reorderLevel: '10',
        expiryDate: '',
        dosage: '',
        strength: '',
        form: 'tablet',
        prescriptionRequired: false,
        sideEffects: '',
        contraindications: '',
        storageConditions: 'room temperature'
    });
    
    const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        search: '',
        lowStock: false,
        expiring: false
    });

    // Auto-load data on component mount
    useEffect(() => {
        loadCategories();
        loadMedicines();
    }, [subdomain]);

    // Reload medicines when filters change
    useEffect(() => {
        loadMedicines();
    }, [filters]);

    const loadCategories = async () => {
        try {
            const response = await fetch(`/api/tenant/${subdomain}/categories`);
            const data = await response.json();
            
            if (data.success) {
                setCategories(data.categories);
            }
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    };

    const loadMedicines = async () => {
        try {
            setLoading(true);
            setError('');
            
            const queryParams = new URLSearchParams();
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.lowStock) queryParams.append('lowStock', 'true');
            if (filters.expiring) queryParams.append('expiring', 'true');
            
            const response = await fetch(`/api/tenant/${subdomain}/medicines?${queryParams}`);
            const data = await response.json();
            
            if (data.success) {
                setMedicines(data.medicines);
                setMessage(data.message || `✅ Auto-loaded ${data.medicines.length} medicines`);
            } else {
                setError(data.error || 'Failed to load medicines');
            }
        } catch (err) {
            setError('Failed to connect to auto-save system');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFilters(prev => ({ ...prev, [name]: checked }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            genericName: '',
            brandName: '',
            category: '',
            subcategory: '',
            description: '',
            manufacturer: '',
            supplier: '',
            batchNumber: '',
            price: '',
            quantity: '',
            reorderLevel: '10',
            expiryDate: '',
            dosage: '',
            strength: '',
            form: 'tablet',
            prescriptionRequired: false,
            sideEffects: '',
            contraindications: '',
            storageConditions: 'room temperature'
        });
        setEditingMedicine(null);
        setShowForm(false);
        setError('');
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setError('Medicine name is required');
            return false;
        }
        if (!formData.category) {
            setError('Category is required');
            return false;
        }
        if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
            setError('Valid price is required');
            return false;
        }
        if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
            setError('Valid quantity is required');
            return false;
        }
        if (!formData.expiryDate) {
            setError('Expiry date is required');
            return false;
        }
        
        const expiryDate = new Date(formData.expiryDate);
        if (expiryDate <= new Date()) {
            setError('Expiry date must be in the future');
            return false;
        }
        
        return true;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`/api/tenant/${subdomain}/medicines`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    quantity: parseInt(formData.quantity),
                    reorderLevel: parseInt(formData.reorderLevel)
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMessage(data.message || '✅ Medicine auto-saved to MongoDB Atlas');
                resetForm();
                await loadMedicines();
            } else {
                setError(data.error || 'Auto-save CREATE failed');
            }
        } catch (err) {
            setError('Failed to auto-save medicine');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (medicine: Medicine) => {
        setEditingMedicine(medicine);
        setFormData({
            name: medicine.name,
            genericName: medicine.genericName || '',
            brandName: medicine.brandName || '',
            category: medicine.category,
            subcategory: medicine.subcategory || '',
            description: medicine.description || '',
            manufacturer: medicine.manufacturer || '',
            supplier: medicine.supplier || '',
            batchNumber: medicine.batchNumber || '',
            price: medicine.pricing?.sellingPrice?.toString() || medicine.price?.toString() || '',
            quantity: medicine.stock?.current?.toString() || medicine.quantity?.toString() || '',
            reorderLevel: medicine.stock?.minimum?.toString() || medicine.reorderLevel?.toString() || '10',
            expiryDate: medicine.dates?.expiryDate ? medicine.dates.expiryDate.split('T')[0] : medicine.expiryDate?.split('T')[0] || '',
            dosage: medicine.dosage || '',
            strength: medicine.strength || '',
            form: medicine.form || 'tablet',
            prescriptionRequired: medicine.regulatory?.prescriptionRequired || medicine.prescriptionRequired || false,
            sideEffects: Array.isArray(medicine.sideEffects) ? medicine.sideEffects.join(', ') : medicine.sideEffects || '',
            contraindications: Array.isArray(medicine.contraindications) ? medicine.contraindications.join(', ') : medicine.contraindications || '',
            storageConditions: medicine.storage?.temperature || medicine.storageConditions || 'room temperature'
        });
        setShowForm(true);
        setError('');
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingMedicine || !validateForm()) return;

        try {
            setLoading(true);
            setError('');
            
            // Show immediate feedback
            setMessage('🔄 Updating medicine in MongoDB Atlas...');
            
            const response = await fetch(`/api/tenant/${subdomain}/medicines/${editingMedicine._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    quantity: parseInt(formData.quantity),
                    reorderLevel: parseInt(formData.reorderLevel)
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Immediate success feedback
                setMessage('✅ Medicine successfully updated in MongoDB Atlas!');
                
                // Update the local state immediately for instant UI response
                setMedicines(prevMedicines => 
                    prevMedicines.map(med => 
                        med._id === editingMedicine._id 
                            ? { ...med, ...data.medicine }
                            : med
                    )
                );
                
                resetForm();
                
                // Optional: Reload from server to ensure consistency
                setTimeout(() => {
                    loadMedicines();
                }, 1000);
            } else {
                setError(data.error || 'Auto-save UPDATE failed');
            }
        } catch (err) {
            setError('Failed to auto-update medicine');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (medicineId: string, medicineName: string) => {
        if (!confirm(`Are you sure you want to delete "${medicineName}"? This will immediately remove it from MongoDB Atlas.`)) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            // Show immediate feedback
            setMessage('🗑️ Deleting medicine from MongoDB Atlas...');
            
            // Optimistically remove from UI for immediate response
            const originalMedicines = [...medicines];
            setMedicines(prevMedicines => 
                prevMedicines.filter(med => med._id !== medicineId)
            );
            
            const response = await fetch(`/api/tenant/${subdomain}/medicines/${medicineId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMessage('✅ Medicine successfully deleted from MongoDB Atlas!');
                
                // Clear message after 3 seconds
                setTimeout(() => {
                    setMessage('');
                }, 3000);
            } else {
                // Revert optimistic update on failure
                setMedicines(originalMedicines);
                setError(data.error || 'Auto-save DELETE failed');
            }
        } catch (err) {
            // Revert optimistic update on error
            setMedicines(medicines);
            setError('Failed to auto-delete medicine');
        } finally {
            setLoading(false);
        }
    };

    const medicineFormOptions = {
        forms: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'patch', 'suppository'],
        storageConditions: ['room temperature', 'refrigerated', 'frozen', 'cool dry place', 'protect from light']
    };

    const getStockStatus = (medicine: Medicine) => {
        const current = medicine.stock?.current || medicine.quantity || 0;
        const minimum = medicine.stock?.minimum || medicine.reorderLevel || 10;
        
        if (current <= minimum) {
            return { status: 'Low Stock', color: 'text-red-600 bg-red-50' };
        } else if (current <= minimum * 2) {
            return { status: 'Medium Stock', color: 'text-yellow-600 bg-yellow-50' };
        } else {
            return { status: 'Good Stock', color: 'text-green-600 bg-green-50' };
        }
    };

    const getExpiryStatus = (expiryDate: string) => {
        // Handle nested date structure
        const dateStr = typeof expiryDate === 'object' && expiryDate !== null 
            ? (expiryDate as any).expiryDate || expiryDate 
            : expiryDate;
            
        const expiry = new Date(dateStr);
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        if (expiry <= now) {
            return { status: 'Expired', color: 'text-red-600 bg-red-50' };
        } else if (expiry <= thirtyDaysFromNow) {
            return { status: 'Expiring Soon', color: 'text-orange-600 bg-orange-50' };
        } else {
            return { status: 'Good', color: 'text-green-600 bg-green-50' };
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Auto-Save Medicine Manager
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
                    {showForm ? 'Hide Form' : 'Add New Medicine'}
                </button>
                
                <button
                    onClick={loadMedicines}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh Medicines'}
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            name="category"
                            value={filters.category}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category._id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search medicines..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className="flex items-center space-x-4 pt-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="lowStock"
                                checked={filters.lowStock}
                                onChange={handleFilterChange}
                                className="mr-2"
                            />
                            Low Stock
                        </label>
                        
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="expiring"
                                checked={filters.expiring}
                                onChange={handleFilterChange}
                                className="mr-2"
                            />
                            Expiring Soon
                        </label>
                    </div>
                </div>
            </div>

            {/* Medicine Form */}
            {showForm && (
                <form onSubmit={editingMedicine ? handleUpdate : handleCreate} className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingMedicine ? 'Edit Medicine (Auto-Update)' : 'Create Medicine (Auto-Save)'}
                    </h3>
                    
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Medicine Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Generic Name
                            </label>
                            <input
                                type="text"
                                name="genericName"
                                value={formData.genericName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Brand Name
                            </label>
                            <input
                                type="text"
                                name="brandName"
                                value={formData.brandName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Category and Classification */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subcategory
                            </label>
                            <input
                                type="text"
                                name="subcategory"
                                value={formData.subcategory}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Form
                            </label>
                            <select
                                name="form"
                                value={formData.form}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {medicineFormOptions.forms.map(form => (
                                    <option key={form} value={form}>
                                        {form.charAt(0).toUpperCase() + form.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Pricing and Inventory */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price ($) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reorder Level
                            </label>
                            <input
                                type="number"
                                name="reorderLevel"
                                value={formData.reorderLevel}
                                onChange={handleInputChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expiry Date *
                            </label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Manufacturer
                            </label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Supplier
                            </label>
                            <input
                                type="text"
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Batch Number
                            </label>
                            <input
                                type="text"
                                name="batchNumber"
                                value={formData.batchNumber}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dosage
                            </label>
                            <input
                                type="text"
                                name="dosage"
                                value={formData.dosage}
                                onChange={handleInputChange}
                                placeholder="e.g., 500mg twice daily"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Strength
                            </label>
                            <input
                                type="text"
                                name="strength"
                                value={formData.strength}
                                onChange={handleInputChange}
                                placeholder="e.g., 500mg"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Storage Conditions
                            </label>
                            <select
                                name="storageConditions"
                                value={formData.storageConditions}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {medicineFormOptions.storageConditions.map(condition => (
                                    <option key={condition} value={condition}>
                                        {condition.charAt(0).toUpperCase() + condition.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description and Medical Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Side Effects
                            </label>
                            <textarea
                                name="sideEffects"
                                value={formData.sideEffects}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraindications
                            </label>
                            <textarea
                                name="contraindications"
                                value={formData.contraindications}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Prescription Required */}
                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="prescriptionRequired"
                                checked={formData.prescriptionRequired}
                                onChange={handleInputChange}
                                className="mr-2"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Prescription Required
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Auto-Saving...' : (editingMedicine ? 'Auto-Update' : 'Auto-Save')}
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

            {/* Medicines List */}
            <div>
                <h3 className="text-lg font-semibold mb-4">
                    Medicines ({medicines.length}) - Auto-Loaded from MongoDB Atlas
                </h3>
                
                {medicines.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No medicines found. Create your first medicine above!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {medicines.map(medicine => {
                            const stockStatus = getStockStatus(medicine);
                            const expiryDate = medicine.dates?.expiryDate || medicine.expiryDate;
                            const expiryStatus = getExpiryStatus(expiryDate);
                            const price = medicine.pricing?.sellingPrice || medicine.price || 0;
                            const quantity = medicine.stock?.current || medicine.quantity || 0;
                            const reorderLevel = medicine.stock?.minimum || medicine.reorderLevel || 10;
                            const prescriptionRequired = medicine.regulatory?.prescriptionRequired || medicine.prescriptionRequired;
                            
                            return (
                                <div
                                    key={medicine._id}
                                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-gray-900">{medicine.name}</h4>
                                        <div className="flex gap-1">
                                            <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                                                {stockStatus.status}
                                            </span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${expiryStatus.color}`}>
                                                {expiryStatus.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {medicine.genericName && (
                                        <p className="text-sm text-gray-600 mb-1">
                                            Generic: {medicine.genericName}
                                        </p>
                                    )}
                                    
                                    <div className="text-sm text-gray-600 mb-2">
                                        <p>Category: {medicine.category}</p>
                                        <p>Price: ${price}</p>
                                        <p>Stock: {quantity} (Reorder at: {reorderLevel})</p>
                                        <p>Expires: {new Date(expiryDate).toLocaleDateString()}</p>
                                        {prescriptionRequired && (
                                            <p className="text-red-600 font-medium">⚠️ Prescription Required</p>
                                        )}
                                    </div>
                                    
                                    <div className="text-xs text-gray-400 mb-3">
                                        Created: {new Date(medicine.createdAt).toLocaleDateString()}
                                        {medicine.updatedAt && (
                                            <span> • Updated: {new Date(medicine.updatedAt).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(medicine)}
                                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                            disabled={loading}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(medicine._id, medicine.name)}
                                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}