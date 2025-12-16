import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '../../../../lib/services/multi-tenant-db';
import { PasswordUtils } from '../../../../lib/password-utils';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      // Pharmacy/Tenant Details
      pharmacyName,
      subdomain,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      pharmacyEmail,
      
      // Owner/Admin Details
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      
      // Optional
      subscriptionPlan = 'starter'
    } = data;

    console.log('📝 Registration attempt for pharmacy:', pharmacyName);

    // Validate required fields
    if (!pharmacyName || !subdomain || !address || !city || !country || 
        !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = PasswordUtils.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password does not meet security requirements', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Clean and validate subdomain format
    const cleanSubdomain = subdomain.toLowerCase().trim().replace(/\s+/g, '-');
    const subdomainRegex = /^[a-z0-9-]+$/;
    
    if (!subdomainRegex.test(cleanSubdomain)) {
      return NextResponse.json(
        { error: 'Subdomain can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    if (cleanSubdomain.length < 3 || cleanSubdomain.length > 50) {
      return NextResponse.json(
        { error: 'Subdomain must be between 3 and 50 characters' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking subdomain availability:', cleanSubdomain);

    // Check if subdomain already exists
    const existingTenant = await multiTenantDb.getTenantBySubdomain(cleanSubdomain);
    if (existingTenant) {
      console.log('❌ Subdomain already exists:', cleanSubdomain);
      return NextResponse.json(
        { error: `The subdomain "${cleanSubdomain}" is already taken. Please choose a different one.` },
        { status: 400 }
      );
    }

    console.log('✅ Subdomain available:', cleanSubdomain);

    // Check if email already exists
    const existingUser = await multiTenantDb.getSuperAdminByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, creating tenant and admin...');
    console.log('📝 Registration data summary:', {
      pharmacyName: pharmacyName.trim(),
      subdomain: cleanSubdomain,
      adminEmail: email,
      adminName: `${firstName} ${lastName}`,
      address: `${address}, ${city}, ${state}, ${country} ${postalCode}`,
      phone: phone
    });

    // Create the tenant (pharmacy) with all details
    console.log('🏗️  Creating tenant with data:', {
      name: pharmacyName,
      subdomain: cleanSubdomain,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      pharmacyEmail: pharmacyEmail || email
    });

    const newTenant = await multiTenantDb.createTenant({
      name: pharmacyName.trim(),
      subdomain: cleanSubdomain,
      ownerId: '000000000000000000000000', // Will be updated after creating admin
      subscriptionPlan: subscriptionPlan as 'starter' | 'professional' | 'enterprise',
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
        email: pharmacyEmail || email,
        phone: phone,
        address: address,
        city: city,
        state: state,
        country: country,
        postalCode: postalCode
      },
      billing: {
        companyName: pharmacyName,
        billingEmail: email
      }
    });

    console.log('✅ Tenant created:', newTenant._id);

    // Create admin user for the tenant
    const adminUser = await multiTenantDb.createUser(newTenant._id.toString(), {
      username: `${cleanSubdomain}_admin`,
      email: email,
      password: password, // Will be hashed by createUser method
      firstName: firstName,
      lastName: lastName,
      role: 'admin',
      permissions: [
        'manage_users', 'manage_medicines', 'manage_prescriptions', 
        'view_reports', 'manage_settings',
        'dispense_medicines', 'create_prescriptions', 'view_inventory'
      ],
      profile: {
        phone: phone
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

    console.log('✅ Admin user created:', adminUser._id);

    // Update tenant with owner ID
    await multiTenantDb.updateTenant(newTenant._id.toString(), {
      ownerId: adminUser._id
    });

    console.log('✅ Registration completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Pharmacy registered successfully! You can now login with your credentials.',
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
        lastName: adminUser.lastName
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}