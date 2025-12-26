'use client';

import React, { useState } from 'react';
import CategoryManager from './CategoryManager';

interface MedicineFormData {
    name: string;
    category: string;
    price: string;
    quantity: string;
    expiryDate: string;
    description?: string;
    reorderLevel?: string;
}

interface MedicineFormProps {
    onSubmit: (data: MedicineFormData) => void;
    isLoading?: boolean;
}

export default function MedicineForm({ onSubmit, isLoading = false }: MedicineFormProps) {
    const [formData, setFormData] = useState<MedicineFormData>({
        name: '',
        category: '',
        price: '',
        quantity: '',
        expiryDate: '',
        description: '',
        reorderLevel: '10'
    });

    const [errors, setErrors] = useState<Partial<MedicineFormData>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name as keyof MedicineFormData]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleCategorySelect = (category: string) => {
        setFormData(prev => ({ ...prev, category }));
        if (errors.category) {
            setErrors(prev => ({ ...prev, category: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<MedicineFormData> = {};

        if (!formData.name.trim()) newErrors.name = 'Medicine name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
            newErrors.price = 'Valid price is required';
        }
        if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
            newErrors.quantity = 'Valid quantity is required';
        }
        if (!formData.expiryDate) {
            newErrors.expiryDate = 'Expiry date is required';
        } else {
            const expiryDate = new Date(formData.expiryDate);
            if (expiryDate <= new Date()) {
                newErrors.expiryDate = 'Expiry date must be in the future';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Medicine</h2>
            
            {/* Medicine Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicine Name *
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter medicine name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Category Manager */}
            <div>
                <CategoryManager
                    selectedCategory={formData.category}
                    onCategorySelect={handleCategorySelect}
                    subdomain="your-subdomain" // Replace with actual subdomain
                    showSearch={true}
                    allowManagement={true}
                />
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            {/* Price and Quantity Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($) *
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                    />
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                    </label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        min="0"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.quantity ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0"
                    />
                    {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                </div>
            </div>

            {/* Expiry Date and Reorder Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                    </label>
                    <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reorder Level
                    </label>
                    <input
                        type="number"
                        name="reorderLevel"
                        value={formData.reorderLevel}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10"
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description or notes"
                />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {isLoading ? 'Adding Medicine...' : 'Add Medicine'}
                </button>
            </div>
        </form>
    );
}