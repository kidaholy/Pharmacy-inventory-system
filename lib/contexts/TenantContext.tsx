'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ITenant } from '../models/Tenant';

interface TenantContextType {
  tenant: ITenant | null;
  tenantId: string | null;
  isLoading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

interface TenantProviderProps {
  children: React.ReactNode;
  subdomain?: string;
}

export function TenantProvider({ children, subdomain }: TenantProviderProps) {
  const [tenant, setTenant] = useState<ITenant | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTenantFromSubdomain = (hostname: string): string | null => {
    // Extract subdomain from hostname
    // Examples: 
    // - pharmacy1.pharmatrack.com -> pharmacy1
    // - localhost:3000 -> null (development)
    // - pharmatrack.com -> null (main domain)
    
    if (hostname.includes('localhost') || hostname === 'pharmatrack.com') {
      return null;
    }
    
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
    
    return null;
  };

  const fetchTenant = async (subdomainToFetch: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/tenant/${subdomainToFetch}`);
      
      if (!response.ok) {
        throw new Error('Tenant not found');
      }
      
      const tenantData = await response.json();
      setTenant(tenantData);
      setTenantId(tenantData._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tenant');
      setTenant(null);
      setTenantId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTenant = async () => {
    if (subdomain) {
      await fetchTenant(subdomain);
    } else if (typeof window !== 'undefined') {
      const detectedSubdomain = getTenantFromSubdomain(window.location.hostname);
      if (detectedSubdomain) {
        await fetchTenant(detectedSubdomain);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    refreshTenant();
  }, [subdomain]);

  const value: TenantContextType = {
    tenant,
    tenantId,
    isLoading,
    error,
    refreshTenant
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

// Hook for getting tenant-specific API endpoints
export function useTenantApi() {
  const { tenantId } = useTenant();
  
  const getApiUrl = (endpoint: string) => {
    if (!tenantId) {
      throw new Error('No tenant context available');
    }
    return `/api/tenant/${tenantId}${endpoint}`;
  };
  
  return { getApiUrl, tenantId };
}