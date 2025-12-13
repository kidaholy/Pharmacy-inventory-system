import { headers } from 'next/headers';

export async function getTenantId(): Promise<string | null> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  // Extract subdomain from host
  // Example: tenant1.pharmacloud.com -> tenant1
  const subdomain = host.split('.')[0];
  
  // For localhost development, you can use a query parameter or header
  if (host.includes('localhost')) {
    return headersList.get('x-tenant-id') || 'default';
  }
  
  // Skip admin subdomain
  if (subdomain === 'admin') {
    return null;
  }
  
  return subdomain;
}

export function getTenantFromSession(session: any): string | null {
  return session?.user?.tenantId || null;
}