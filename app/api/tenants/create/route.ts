import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../../lib/services/multi-tenant-db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      tenantName, 
      subdomain, 
      subscriptionPlan,
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPassword,
      contactEmail,
      contactPhone,
      city,
      country
    } = data;

    // Validate required fields
    if (!tenantName || !subdomain || !adminFirstName || !adminLastName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if subdomain already exists
    const existingTenant = await multiTenantDb.getTenantBySubdomain(subdomain);
    if (existingTenant) {
      return NextResponse.json(
        { error: 'Subdomain already exists' },
        { status: 400 }
      );
    }

    // Create tenant
    const newTenant = await multiTenantDb.createTenant({
      name: tenantName,
      subdomain: subdomain.toLowerCase(),
      ownerId: '000000000000000000000000', // Temporary, will be updated after creating admin
      subscriptionPlan: subscriptionPlan || 'starter',
      subscriptionStatus: 'active',
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        features: ['inventory', 'prescriptions'],
        limits: {
          users: subscriptionPlan === 'enterprise' ? 50 : subscriptionPlan === 'professional' ? 20 : 5,
          medicines: subscriptionPlan === 'enterprise' ? 10000 : subscriptionPlan === 'professional' ? 5000 : 1000,
          prescriptions: subscriptionPlan === 'enterprise' ? 50000 : subscriptionPlan === 'professional' ? 20000 : 10000,
          storage: subscriptionPlan === 'enterprise' ? 1000 : subscriptionPlan === 'professional' ? 500 : 100
        }
      },
      contact: {
        email: contactEmail || adminEmail,
        phone: contactPhone,
        city: city,
        country: country
      },
      billing: {
        companyName: tenantName
      }
    });

    // Create admin user for the tenant
    const adminUser = await multiTenantDb.createUser(newTenant._id.toString(), {
      username: `${subdomain}_admin`,
      email: adminEmail,
      password: adminPassword, // In production, this should be hashed
      firstName: adminFirstName,
      lastName: adminLastName,
      role: 'admin',
      permissions: [
        'manage_users', 'manage_medicines', 'manage_prescriptions', 
        'view_reports', 'manage_settings',
        'dispense_medicines', 'create_prescriptions', 'view_inventory'
      ],
      profile: {
        phone: contactPhone
      },
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          sms: false,
          push: true,
          lowStock: true,
          expiry: true,
          prescriptions: true
        }
      },
      security: {
        failedLoginAttempts: 0,
        twoFactorEnabled: false,
        recoveryTokens: []
      },
      isActive: true,
      isEmailVerified: false
    });

    // Update tenant with owner ID
    await multiTenantDb.updateTenant(newTenant._id.toString(), {
      ownerId: adminUser._id
    });

    return NextResponse.json({
      success: true,
      tenant: {
        _id: newTenant._id,
        name: newTenant.name,
        subdomain: newTenant.subdomain,
        subscriptionPlan: newTenant.subscriptionPlan
      },
      admin: {
        _id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role
      },
      message: 'Tenant and admin user created successfully'
    });

  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { error: 'Failed to create tenant and admin user' },
      { status: 500 }
    );
  }
}