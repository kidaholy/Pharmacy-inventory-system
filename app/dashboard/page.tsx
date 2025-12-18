'use client';

import { useState, useEffect } from 'react';
import { auth, User } from '../../lib/auth';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, CreditCard, Activity, AlertTriangle, FileText, Settings, Users, ArrowUpRight } from "lucide-react";

interface TenantStats {
  totalMedicines: number;
  totalUsers: number;
  lowStockCount: number;
  expiringCount: number;
  pendingPrescriptions: number;
  totalInventoryValue: number;
}

interface TenantInfo {
  _id: string;
  name: string;
  subdomain: string;
  subscriptionPlan: string;
  contact: {
    email: string;
    phone?: string;
    city?: string;
    country?: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const currentUser = auth.requireAuth();
    if (!currentUser) {
      return;
    }

    // Redirect regular users to their tenant-specific dashboard
    if (currentUser.role !== 'super_admin' && currentUser.tenantSubdomain) {
      // NOTE: We might want to handle this differently in the future, 
      // but keeping existing logic for now.
      // window.location.href = `/${currentUser.tenantSubdomain}/dashboard`;
      // For now, we are on /dashboard, so we should stay here or redirect to /inventory if strictly needed
      // but user requested redesign of THIS page.
    }

    setUser(currentUser);
    loadDashboardData(currentUser);
  }, []);

  // Update document title based on tenant info
  useEffect(() => {
    if (tenantInfo) {
      document.title = `${tenantInfo.name} - Dashboard`;
    } else if (user?.role === 'super_admin') {
      document.title = 'Super Admin Dashboard';
    } else {
      document.title = 'PharmaTrack Dashboard';
    }
  }, [tenantInfo, user]);

  const loadDashboardData = async (currentUser: User) => {
    try {
      setLoading(true);
      setError(null);

      // Skip data loading for super admin (tenant-independent)
      if (currentUser.role === 'super_admin' || !currentUser.tenantId) {
        setLoading(false);
        return;
      }

      console.log('📊 Loading dashboard data for tenant:', currentUser.tenantSubdomain);

      // Load tenant information using subdomain
      const tenantResponse = await fetch(`/api/tenant/${currentUser.tenantSubdomain}`);
      if (tenantResponse.ok) {
        const tenantData = await tenantResponse.json();
        setTenantInfo(tenantData);
      }

      // Load tenant statistics using subdomain
      const statsResponse = await fetch(`/api/tenant/${currentUser.tenantSubdomain}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        setStats({
          totalMedicines: 0,
          totalUsers: 1,
          lowStockCount: 0,
          expiringCount: 0,
          pendingPrescriptions: 0,
          totalInventoryValue: 0
        });
      }

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      setStats({
        totalMedicines: 0,
        totalUsers: 1,
        lowStockCount: 0,
        expiringCount: 0,
        pendingPrescriptions: 0,
        totalInventoryValue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-xl text-muted-foreground animate-pulse">Loading Dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
            <p className="text-muted-foreground">
              {tenantInfo ? `Welcome back to ${tenantInfo.name}` : 'Welcome back'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Place for date picker or filter if needed */}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalMedicines || 0}</div>
              <p className="text-xs text-muted-foreground">Items in stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(stats?.totalInventoryValue || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total asset value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.lowStockCount || 0}</div>
              <p className="text-xs text-muted-foreground">Items needing attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Rx</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingPrescriptions || 0}</div>
              <p className="text-xs text-muted-foreground">Orders to process</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Quick Actions / Recent Activity - Taking up 4/7 columns */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you perform daily.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Link href="/inventory" className="block group">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 hover:border-blue-300 transition-all flex items-start gap-4 h-full">
                  <div className="bg-blue-500/10 p-2 rounded-md">
                    <Pill className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-1">
                      Manage Inventory <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Add stock, update prices, or check limits.</p>
                  </div>
                </div>
              </Link>

              <Link href="/prescriptions" className="block group">
                <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800 hover:border-violet-300 transition-all flex items-start gap-4 h-full">
                  <div className="bg-violet-500/10 p-2 rounded-md">
                    <FileText className="h-6 w-6 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-violet-900 dark:text-violet-100 flex items-center gap-1">
                      Prescriptions <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </h4>
                    <p className="text-sm text-violet-700 dark:text-violet-300 mt-1">Process new orders and review history.</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* System Info / Tenant Info - Taking up 3/7 columns */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                {tenantInfo?.name || 'PharmaSuite System'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plan</span>
                  <span className="text-sm text-muted-foreground capitalize">{tenantInfo?.subscriptionPlan || 'Standard'}</span>
                </div>
                {tenantInfo?.contact?.city && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Location</span>
                    <span className="text-sm text-muted-foreground">{tenantInfo.contact.city}</span>
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" /> System Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
