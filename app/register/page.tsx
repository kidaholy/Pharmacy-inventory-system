'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Pharmacy Details
    pharmacyName: '',
    subdomain: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phone: '',
    pharmacyEmail: '',

    // Agreement
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;

    // Special handling for subdomain
    if (name === 'subdomain') {
      processedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/\s+/g, '-');
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Personal Details
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    // Pharmacy Details
    if (!formData.pharmacyName.trim()) newErrors.pharmacyName = 'Pharmacy name is required';
    if (!formData.subdomain.trim()) newErrors.subdomain = 'Subdomain is required';
    else if (!/^[a-z0-9-]+$/.test(formData.subdomain.toLowerCase())) newErrors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Personal Details
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,

          // Pharmacy Details
          pharmacyName: formData.pharmacyName,
          subdomain: formData.subdomain.toLowerCase(),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
          phone: formData.phone,
          pharmacyEmail: formData.pharmacyEmail || formData.email,

          subscriptionPlan: 'starter'
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Registration successful! Your pharmacy "${result.tenant.name}" has been created. You can now login with your credentials.`);
        window.location.href = '/login';
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 relative">

      {/* Top Navigation / Logo */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-medi-green rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xs">MH</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-medi-green">MediHeal</span>
        </div>
        <a href="/" className="text-sm font-bold text-slate-500 hover:text-medi-green transition-colors"> &larr; Back to Home</a>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">

        {/* Helper Banner */}
        <div className="bg-medi-green/5 p-6 border-b border-medi-green/10 text-center">
          <h1 className="text-2xl font-extrabold text-medi-green">Create Pharmacy Account</h1>
          <p className="text-slate-600 text-sm mt-1">Join thousands of pharmacies digitizing their operations.</p>
        </div>

        <div className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* General Error */}
            {errors.general && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 font-medium text-sm flex items-center gap-2">
                <span>⚠️</span> {errors.general}
              </div>
            )}

            {/* SECTION: Personal Details */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-medi-green text-white flex items-center justify-center text-xs">1</span>
                Personal Admin Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium ${errors.firstName ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-xs text-red-500 mt-1 font-bold">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium ${errors.lastName ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="text-xs text-red-500 mt-1 font-bold">{errors.lastName}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Admin Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium ${errors.email ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="admin@pharmacy.com"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1 font-bold">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium ${errors.password ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-xs text-red-500 mt-1 font-bold">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium ${errors.confirmPassword ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 font-bold">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* SECTION: Pharmacy Details */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-medi-green text-white flex items-center justify-center text-xs">2</span>
                Pharmacy Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Pharmacy Name</label>
                  <input
                    name="pharmacyName"
                    type="text"
                    value={formData.pharmacyName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium ${errors.pharmacyName ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="City Care Pharmacy"
                  />
                  {errors.pharmacyName && <p className="text-xs text-red-500 mt-1 font-bold">{errors.pharmacyName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Subdomain</label>
                  <div className="relative">
                    <input
                      name="subdomain"
                      type="text"
                      value={formData.subdomain}
                      onChange={handleInputChange}
                      className={`w-full pl-4 pr-32 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium ${errors.subdomain ? 'border-red-300' : 'border-slate-200'}`}
                      placeholder="citycare"
                    />
                    <div className="absolute right-4 top-3.5 text-slate-400 text-sm font-semibold pointer-events-none">.mediheal.com</div>
                  </div>
                  {errors.subdomain && <p className="text-xs text-red-500 mt-1 font-bold">{errors.subdomain}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Address</label>
                  <input
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium ${errors.address ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="123 Health St, Medical District"
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1 font-bold">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                  <input
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium ${errors.city ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="New York"
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1 font-bold">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                  <input
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium ${errors.country ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="United States"
                  />
                  {errors.country && <p className="text-xs text-red-500 mt-1 font-bold">{errors.country}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Postal Code</label>
                  <input
                    name="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium"
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Pharmacy Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium ${errors.phone ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1 font-bold">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className={`p-4 rounded-xl border ${errors.agreeToTerms ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="w-5 h-5 mt-0.5 text-medi-green rounded focus:ring-medi-green border-gray-300"
                />
                <span className="text-sm text-slate-600">
                  I agree to the <a href="#" className="font-bold text-medi-green hover:underline">Terms of Service</a> & <a href="#" className="font-bold text-medi-green hover:underline">Privacy Policy</a> governing the use of MediHeal Cloud.
                </span>
              </label>
              {errors.agreeToTerms && <p className="text-xs text-red-500 mt-2 font-bold ml-8">{errors.agreeToTerms}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-medi-green text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-medi-green/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </button>

            <div className="text-center mt-6">
              <p className="text-slate-500 text-sm font-medium">Already have an account? <a href="/login" className="text-medi-green font-bold hover:underline">Sign In</a></p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}