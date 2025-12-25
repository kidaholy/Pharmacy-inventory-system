import { NextResponse } from 'next/server';
import { multiTenantDb } from '../../../lib/services/multi-tenant-db';
import Tenant from '../../../lib/models/Tenant';
import MultiTenantUser from '../../../lib/models/MultiTenantUser';
import Medicine from '../../../lib/models/Medicine';
import Prescription from '../../../lib/models/Prescription';
import mongoose from 'mongoose';

// Endpoint to seed sample data for testing
export async function POST() {
    try {
        await multiTenantDb.ensureConnection();

        // Sample medicines data
        const sampleMedicines = [
            {
                name: 'Paracetamol 500mg',
                genericName: 'Acetaminophen',
                category: 'Pain Relief',
                manufacturer: 'PharmaCorp',
                stock: { current: 150, minimum: 20, maximum: 500 },
                pricing: { costPrice: 0.50, sellingPrice: 1.20, margin: 58.33 },
                dates: { expiryDate: new Date('2025-12-31') }
            },
            {
                name: 'Amoxicillin 250mg',
                genericName: 'Amoxicillin',
                category: 'Antibiotics',
                manufacturer: 'MediLab',
                stock: { current: 80, minimum: 15, maximum: 300 },
                pricing: { costPrice: 2.00, sellingPrice: 4.50, margin: 55.56 },
                dates: { expiryDate: new Date('2025-08-15') }
            },
            {
                name: 'Vitamin C 1000mg',
                genericName: 'Ascorbic Acid',
                category: 'Vitamins',
                manufacturer: 'HealthPlus',
                stock: { current: 200, minimum: 30, maximum: 600 },
                pricing: { costPrice: 0.75, sellingPrice: 2.00, margin: 62.50 },
                dates: { expiryDate: new Date('2026-03-20') }
            }
        ];

        // Sample prescriptions data
        const samplePrescriptions = [
            {
                prescriptionNumber: 'RX240001',
                patient: {
                    name: 'John Doe',
                    phone: '+1234567890',
                    email: 'john.doe@email.com'
                },
                doctor: {
                    name: 'Dr. Smith',
                    license: 'MD12345'
                },
                status: 'dispensed',
                dates: {
                    received: new Date('2024-12-01'),
                    dispensed: new Date('2024-12-01')
                }
            },
            {
                prescriptionNumber: 'RX240002',
                patient: {
                    name: 'Jane Smith',
                    phone: '+1234567891',
                    email: 'jane.smith@email.com'
                },
                doctor: {
                    name: 'Dr. Johnson',
                    license: 'MD12346'
                },
                status: 'pending',
                dates: {
                    received: new Date('2024-12-20')
                }
            }
        ];

        // Get all active tenants
        const tenants = await Tenant.find({ isActive: true });
        
        let totalMedicinesAdded = 0;
        let totalPrescriptionsAdded = 0;

        // Add sample data to each tenant
        for (const tenant of tenants) {
            const tenantObjectId = new mongoose.Types.ObjectId(tenant._id);

            // Add medicines for this tenant
            for (const medicineData of sampleMedicines) {
                const existingMedicine = await Medicine.findOne({
                    tenantId: tenantObjectId,
                    name: medicineData.name
                });

                if (!existingMedicine) {
                    await Medicine.create({
                        ...medicineData,
                        tenantId: tenantObjectId,
                        isActive: true,
                        dates: {
                            ...medicineData.dates,
                            createdAt: new Date(),
                            lastUpdated: new Date()
                        }
                    });
                    totalMedicinesAdded++;
                }
            }

            // Add prescriptions for this tenant
            for (const prescriptionData of samplePrescriptions) {
                const existingPrescription = await Prescription.findOne({
                    tenantId: tenantObjectId,
                    prescriptionNumber: prescriptionData.prescriptionNumber
                });

                if (!existingPrescription) {
                    await Prescription.create({
                        ...prescriptionData,
                        tenantId: tenantObjectId,
                        isActive: true,
                        medicines: [], // Empty for now
                        totalAmount: Math.random() * 100 + 20 // Random amount between 20-120
                    });
                    totalPrescriptionsAdded++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Sample data seeded successfully',
            data: {
                tenantsProcessed: tenants.length,
                medicinesAdded: totalMedicinesAdded,
                prescriptionsAdded: totalPrescriptionsAdded
            }
        });

    } catch (error) {
        console.error('Error seeding data:', error);
        return NextResponse.json(
            { error: 'Failed to seed sample data' },
            { status: 500 }
        );
    }
}

// GET endpoint to check current data status
export async function GET() {
    try {
        await multiTenantDb.ensureConnection();

        const [
            totalTenants,
            totalUsers,
            totalMedicines,
            totalPrescriptions
        ] = await Promise.all([
            Tenant.countDocuments({ isActive: true }),
            MultiTenantUser.countDocuments({ isActive: true }),
            Medicine.countDocuments({ isActive: true }),
            Prescription.countDocuments({ isActive: true })
        ]);

        return NextResponse.json({
            success: true,
            currentData: {
                tenants: totalTenants,
                users: totalUsers,
                medicines: totalMedicines,
                prescriptions: totalPrescriptions
            }
        });

    } catch (error) {
        console.error('Error checking data status:', error);
        return NextResponse.json(
            { error: 'Failed to check data status' },
            { status: 500 }
        );
    }
}