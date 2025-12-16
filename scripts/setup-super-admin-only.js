const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function setupSuperAdminOnly() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    
    console.log('👑 Super admin will be tenant-independent');
    
    // Check if super admin already exists
    const existingSuperAdmin = await MultiTenantUser.findOne({ 
      email: 'kidayos2014@gmail.com' 
    });
    
    if (existingSuperAdmin) {
      console.log('👤 Super admin already exists, updating...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('password', 12);
      
      // Update the existing super admin (no tenant needed)
      await MultiTenantUser.findByIdAndUpdate(existingSuperAdmin._id, {
        tenantId: null, // Super admin is tenant-independent
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
        'security.lastPasswordChange': new Date(),
        'security.failedLoginAttempts': 0,
        'security.lockedUntil': undefined
      });
      
      console.log('✅ Updated existing super admin');
    } else {
      console.log('👤 Creating new super admin...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('password', 12);
      
      // Create new super admin (tenant-independent)
      const superAdmin = await MultiTenantUser.create({
        tenantId: null, // Super admin is tenant-independent
        username: 'superadmin',
        email: 'kidayos2014@gmail.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        permissions: [
          'manage_users', 'manage_medicines', 'manage_prescriptions', 
          'view_reports', 'manage_settings', 'manage_billing',
          'dispense_medicines', 'create_prescriptions', 'view_inventory',
          'manage_tenants', 'system_admin'
        ],
        profile: {
          phone: '+1234567890'
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
        isEmailVerified: true
      });
      
      console.log('✅ Created new super admin:', superAdmin._id);
    }
    
    // Verify the setup
    const finalSuperAdmin = await MultiTenantUser.findOne({ email: 'kidayos2014@gmail.com' });
    const passwordTest = await bcrypt.compare('password', finalSuperAdmin.password);
    
    console.log('🎉 Setup verification:');
    console.log('   Super admin exists:', !!finalSuperAdmin);
    console.log('   Password test:', passwordTest ? 'PASS' : 'FAIL');
    console.log('   Tenant ID:', finalSuperAdmin.tenantId || 'NONE (tenant-independent)');
    console.log('   Role:', finalSuperAdmin.role);
    console.log('   Active:', finalSuperAdmin.isActive);
    
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Email: kidayos2014@gmail.com');
    console.log('   Password: password');
    
  } catch (error) {
    console.error('❌ Error setting up super admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

setupSuperAdminOnly();