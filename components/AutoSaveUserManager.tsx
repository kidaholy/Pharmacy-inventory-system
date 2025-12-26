'use client';

import React, { useState, useEffect } from 'react';

interface User {
    _id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    permissions: string[];
    profile?: {
        phone?: string;
        address?: string;
        dateOfBirth?: string;
        gender?: string;
        profilePicture?: string;
    };
    preferences?: {
        language?: string;
        timezone?: string;
        notifications?: {
            email?: boolean;
            sms?: boolean;
            push?: boolean;
        };
    };
    isActive: boolean;
    isEmailVerified: boolean;
    isPhoneVerified?: boolean;
    createdAt: string;
    updatedAt?: string;
}

interface AutoSaveUserManagerProps {
    subdomain: string;
}

export default function AutoSaveUserManager({ subdomain }: AutoSaveUserManagerProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    // Form states
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'user',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        language: 'en',
        timezone: 'UTC',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true
    });
    
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [filters, setFilters] = useState({
        role: '',
        search: '',
        isEmailVerified: ''
    });

    // Auto-load data on component mount
    useEffect(() => {
        loadUsers();
    }, [subdomain]);

    // Reload users when filters change
    useEffect(() => {
        loadUsers();
    }, [filters]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError('');
            
            const queryParams = new URLSearchParams();
            if (filters.role) queryParams.append('role', filters.role);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.isEmailVerified) queryParams.append('isEmailVerified', filters.isEmailVerified);
            
            const response = await fetch(`/api/tenant/${subdomain}/users?${queryParams}`);
            const data = await response.json();
            
            if (data.success) {
                setUsers(data.users);
                setMessage(data.message || `✅ Auto-loaded ${data.users.length} users`);
            } else {
                setError(data.error || 'Failed to load users');
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
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            role: 'user',
            phone: '',
            address: '',
            dateOfBirth: '',
            gender: '',
            language: 'en',
            timezone: 'UTC',
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true
        });
        setEditingUser(null);
        setShowForm(false);
        setShowPassword(false);
        setError('');
    };

    const validateForm = (): boolean => {
        if (!formData.username.trim()) {
            setError('Username is required');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!editingUser && !formData.password.trim()) {
            setError('Password is required for new users');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Invalid email format');
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
            
            const response = await fetch(`/api/tenant/${subdomain}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMessage(data.message || '✅ User auto-saved to MongoDB Atlas');
                resetForm();
                await loadUsers();
            } else {
                setError(data.error || 'Auto-save CREATE failed');
            }
        } catch (err) {
            setError('Failed to auto-save user');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '', // Don't pre-fill password
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.role,
            phone: user.profile?.phone || '',
            address: user.profile?.address || '',
            dateOfBirth: user.profile?.dateOfBirth ? user.profile.dateOfBirth.split('T')[0] : '',
            gender: user.profile?.gender || '',
            language: user.preferences?.language || 'en',
            timezone: user.preferences?.timezone || 'UTC',
            emailNotifications: user.preferences?.notifications?.email !== false,
            smsNotifications: user.preferences?.notifications?.sms || false,
            pushNotifications: user.preferences?.notifications?.push !== false
        });
        setShowForm(true);
        setError('');
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingUser || !validateForm()) return;

        try {
            setLoading(true);
            setError('');
            
            const updateData = { ...formData };
            if (!formData.password.trim()) {
                delete updateData.password; // Don't update password if empty
            }
            
            const response = await fetch(`/api/tenant/${subdomain}/users/${editingUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMessage(data.message || '✅ User auto-updated in MongoDB Atlas');
                resetForm();
                await loadUsers();
            } else {
                setError(data.error || 'Auto-save UPDATE failed');
            }
        } catch (err) {
            setError('Failed to auto-update user');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string, username: string, permanent: boolean = false) => {
        const action = permanent ? 'permanently delete' : 'deactivate';
        if (!confirm(`Are you sure you want to ${action} user "${username}"? This will auto-save the ${action} to MongoDB Atlas.`)) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const url = permanent 
                ? `/api/tenant/${subdomain}/users/${userId}?permanent=true`
                : `/api/tenant/${subdomain}/users/${userId}`;
            
            const response = await fetch(url, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMessage(data.message || `✅ User auto-${permanent ? 'deleted' : 'deactivated'} in MongoDB Atlas`);
                await loadUsers();
            } else {
                setError(data.error || `Auto-save ${action.toUpperCase()} failed`);
            }
        } catch (err) {
            setError(`Failed to auto-${action} user`);
        } finally {
            setLoading(false);
        }
    };

    const roles = ['user', 'admin', 'manager', 'pharmacist', 'cashier'];
    const genders = ['', 'male', 'female', 'other', 'prefer-not-to-say'];
    const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ar', 'zh', 'ja', 'ko'];
    const timezones = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'];

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'manager': return 'bg-purple-100 text-purple-800';
            case 'pharmacist': return 'bg-blue-100 text-blue-800';
            case 'cashier': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Auto-Save User Manager
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
                    {showForm ? 'Hide Form' : 'Add New User'}
                </button>
                
                <button
                    onClick={loadUsers}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh Users'}
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            name="role"
                            value={filters.role}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Roles</option>
                            {roles.map(role => (
                                <option key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
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
                            placeholder="Search users..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Status</label>
                        <select
                            name="isEmailVerified"
                            value={filters.isEmailVerified}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Users</option>
                            <option value="true">Verified</option>
                            <option value="false">Unverified</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* User Form */}
            {showForm && (
                <form onSubmit={editingUser ? handleUpdate : handleCreate} className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingUser ? 'Edit User (Auto-Update)' : 'Create User (Auto-Save)'}
                    </h3>
                    
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username *
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password {!editingUser && '*'}
                            {editingUser && <span className="text-sm text-gray-500">(leave empty to keep current)</span>}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required={!editingUser}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Role and Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {roles.map(role => (
                                    <option key={role} value={role}>
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {genders.map(gender => (
                                    <option key={gender} value={gender}>
                                        {gender ? gender.charAt(0).toUpperCase() + gender.slice(1).replace('-', ' ') : 'Not specified'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Language
                            </label>
                            <select
                                name="language"
                                value={formData.language}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {languages.map(lang => (
                                    <option key={lang} value={lang}>
                                        {lang.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Notification Preferences */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notification Preferences
                        </label>
                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="emailNotifications"
                                    checked={formData.emailNotifications}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                Email Notifications
                            </label>
                            
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="smsNotifications"
                                    checked={formData.smsNotifications}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                SMS Notifications
                            </label>
                            
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="pushNotifications"
                                    checked={formData.pushNotifications}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                Push Notifications
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Auto-Saving...' : (editingUser ? 'Auto-Update' : 'Auto-Save')}
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

            {/* Users List */}
            <div>
                <h3 className="text-lg font-semibold mb-4">
                    Users ({users.length}) - Auto-Loaded from MongoDB Atlas
                </h3>
                
                {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No users found. Create your first user above!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {users.map(user => (
                            <div
                                key={user._id}
                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{user.username}</h4>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                        {(user.firstName || user.lastName) && (
                                            <p className="text-sm text-gray-500">
                                                {user.firstName} {user.lastName}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                        {user.isEmailVerified ? (
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                ✓ Verified
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                                ⚠ Unverified
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {user.profile?.phone && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        📞 {user.profile.phone}
                                    </p>
                                )}
                                
                                <div className="text-xs text-gray-400 mb-3">
                                    Created: {new Date(user.createdAt).toLocaleDateString()}
                                    {user.updatedAt && (
                                        <span> • Updated: {new Date(user.updatedAt).toLocaleDateString()}</span>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                        disabled={loading}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user._id, user.username, false)}
                                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                        disabled={loading}
                                    >
                                        Deactivate
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user._id, user.username, true)}
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