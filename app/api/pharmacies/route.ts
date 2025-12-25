import { NextResponse } from 'next/server';
import { multiTenantDb } from '../../../lib/services/multi-tenant-db';

// GET - Get all active tenants (public endpoint)
export async function GET() {
    try {
        const tenants = await multiTenantDb.getAllTenants();

        // Filter only active tenants and remove sensitive information
        const publicTenants = tenants
            .filter(t => t.isActive)
            .map(tenant => ({
                _id: tenant._id,
                name: tenant.name,
                subdomain: tenant.subdomain,
                subscriptionPlan: tenant.subscriptionPlan,
                contact: {
                    email: tenant.contact?.email,
                    phone: tenant.contact?.phone,
                    city: tenant.contact?.city,
                    country: tenant.contact?.country
                },
                createdAt: tenant.createdAt
            }));

        return NextResponse.json({
            success: true,
            pharmacies: publicTenants
        });

    } catch (error) {
        console.error('Error fetching public pharmacies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pharmacies' },
            { status: 500 }
        );
    }
}
