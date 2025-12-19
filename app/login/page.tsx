'use client';

import { useState } from 'react';
import { auth } from '../../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    // Authenticate with database (MongoDB or localStorage fallback)
    setTimeout(async () => {
      console.log('Attempting login with:', email, password);
      try {
        const result = await auth.login(email, password);
        console.log('Login result:', result);

        if (result.success && result.user) {
          console.log('Login successful, redirecting user with role:', result.user.role);
          // Redirect based on user role and tenant
          if (result.user.role === 'super_admin') {
            window.location.href = '/super-admin';
          } else if (result.user.tenantSubdomain) {
            // Redirect to tenant-specific dashboard
            window.location.href = `/${result.user.tenantSubdomain}/dashboard`;
          } else {
            // Fallback to generic dashboard
            window.location.href = '/dashboard';
          }
        } else {
          console.log('Login failed:', result.error);
          setError(result.error || 'Invalid email or password');
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('Login failed. Please try again.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-medi-green rounded-b-3xl -z-0"></div>

      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 relative z-10 border border-slate-100">

        {/* Header content */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-medi-green rounded-xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-white font-bold text-lg">MH</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your pharmacy dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium text-slate-900"
              placeholder="name@pharmacy.com"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medi-green/20 focus:border-medi-green transition-all font-medium text-slate-900"
                placeholder="Enter password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-medi-green transition-colors font-medium text-xs uppercase tracking-wide"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-medi-green focus:ring-medi-green" />
              <span className="text-sm text-slate-500 font-medium">Remember me</span>
            </label>
            <a href="#" className="text-sm font-bold text-medi-green hover:underline">Forgot Password?</a>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-lg border border-red-100 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-medi-green text-white py-3.5 rounded-full font-bold text-lg shadow-lg shadow-medi-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          Don't have an account? <a href="/register" className="text-medi-green font-bold hover:underline">Register Pharmacy</a>
        </p>

      </div>

      {/* Footer Text */}
      <div className="absolute bottom-6 text-slate-400 text-xs font-semibold">
        © 2025 MediHeal Cloud Systems
      </div>
    </div>
  );
}