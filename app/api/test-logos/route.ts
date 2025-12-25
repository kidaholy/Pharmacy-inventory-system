import { NextResponse } from 'next/server';
import { multiTenantDb } from '../../../lib/services/multi-tenant-db';
import Tenant from '../../../lib/models/Tenant';

// Test endpoint to add sample logos to tenants
export async function POST() {
    try {
        await multiTenantDb.ensureConnection();
        
        // Sample logo URLs for testing
        const testLogos = [
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=100&h=100&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=100&h=100&fit=crop&crop=center'
        ];
        
        // Find all active tenants
        const tenants = await Tenant.find({ isActive: true });
        
        const updates = [];
        
        // Add logos to tenants that don't have them
        for (let i = 0; i < tenants.length; i++) {
            const tenant = tenants[i];
            
            if (!tenant.settings?.branding?.logo) {
                const logoUrl = testLogos[i % testLogos.length];
                
                await Tenant.findByIdAndUpdate(tenant._id, {
                    $set: {
                        'settings.branding.logo': logoUrl
                    }
                });
                
                updates.push({
                    tenantName: tenant.name,
                    logoUrl: logoUrl
                });
            }
        }
        
        return NextResponse.json({
            success: true,
            message: `Updated ${updates.length} tenants with logos`,
            updates: updates
        });
        
    } catch (error) {
        console.error('Error adding test logos:', error);
        return NextResponse.json(
            { error: 'Failed to add test logos' },
            { status: 500 }
        );
    }
}

// GET endpoint to check current logo status
export async function GET() {
    try {
        await multiTenantDb.ensureConnection();
        
        const tenants = await Tenant.find({ isActive: true }).select('name subdomain settings.branding.logo');
        
        const logoStatus = tenants.map(tenant => ({
            name: tenant.name,
            subdomain: tenant.subdomain,
            hasLogo: !!tenant.settings?.branding?.logo,
            logoUrl: tenant.settings?.branding?.logo || null
        }));
        
        return NextResponse.json({
            success: true,
            tenants: logoStatus
        });
        
    } catch (error) {
        console.error('Error checking logo status:', error);
        return NextResponse.json(
            { error: 'Failed to check logo status' },
            { status: 500 }
        );
    }
}