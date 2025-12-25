import { NextResponse } from 'next/server';
import { multiTenantDb } from '../../../lib/services/multi-tenant-db';
import Tenant from '../../../lib/models/Tenant';
import MultiTenantUser from '../../../lib/models/MultiTenantUser';
import Medicine from '../../../lib/models/Medicine';
import Prescription from '../../../lib/models/Prescription';

export async function GET() {
    try {
        await multiTenantDb.ensureConnection();

        // Get real statistics from database
        const [
            totalTenants,
            activeTenants,
            totalUsers,
            totalMedicines,
            totalPrescriptions
        ] = await Promise.all([
            Tenant.countDocuments({}),
            Tenant.countDocuments({ isActive: true }),
            MultiTenantUser.countDocuments({ isActive: true }),
            Medicine.countDocuments({ isActive: true }),
            Prescription.countDocuments({ isActive: true })
        ]);

        // Calculate total inventory value across all tenants
        const inventoryValue = await Medicine.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    totalValue: {
                        $sum: { $multiply: ['$stock.current', '$pricing.sellingPrice'] }
                    }
                }
            }
        ]);

        const totalInventoryValue = inventoryValue[0]?.totalValue || 0;

        // Calculate uptime (simplified - in real scenario this would come from monitoring)
        const uptime = 99.9; // This could be calculated from actual uptime monitoring

        // Format numbers for display
        const formatNumber = (num: number): string => {
            if (num >= 1000000) {
                return `${(num / 1000000).toFixed(1)}M`;
            } else if (num >= 1000) {
                return `${(num / 1000).toFixed(1)}K`;
            }
            return num.toString();
        };

        const stats = {
            pharmacies: {
                value: activeTenants > 0 ? `${activeTenants}+` : '0',
                rawValue: activeTenants,
                label: 'Pharmacies Trust Us'
            },
            uptime: {
                value: `${uptime}%`,
                rawValue: uptime,
                label: 'Uptime Guarantee'
            },
            transactions: {
                value: totalPrescriptions > 0 ? `${formatNumber(totalPrescriptions)}+` : '0',
                rawValue: totalPrescriptions,
                label: 'Transactions Processed'
            },
            support: {
                value: '24/7',
                rawValue: 24,
                label: 'Expert Support'
            },
            // Additional stats for internal use
            totalUsers,
            totalMedicines,
            totalInventoryValue: Math.round(totalInventoryValue)
        };

        return NextResponse.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        
        // Return fallback stats if database fails
        return NextResponse.json({
            success: false,
            stats: {
                pharmacies: { value: '0', rawValue: 0, label: 'Pharmacies Trust Us' },
                uptime: { value: '99.9%', rawValue: 99.9, label: 'Uptime Guarantee' },
                transactions: { value: '0', rawValue: 0, label: 'Transactions Processed' },
                support: { value: '24/7', rawValue: 24, label: 'Expert Support' },
                totalUsers: 0,
                totalMedicines: 0,
                totalInventoryValue: 0
            },
            error: 'Failed to fetch stats'
        });
    }
}