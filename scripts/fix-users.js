const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function fixUsers() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Delete all existing users
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    const deleteResult = await MultiTenantUser.deleteMany({});
    console.log('🗑️  Deleted', deleteResult.deletedCount, 'existing users');
    
    // Get the tenant
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    const tenant = await Tenant.findOne({ subdomain: 'demo-pharmacy' });
    
    if (!tenant) {
      console.error('❌ Demo tenant not found');
      return;
    }
    
    console.log('📋 Found tenant:', tenant.name, '(ID:', tenant._id + ')');
    
    // Create super admin with username
    const superAdminData = {
      tenantId: tenant._id,
      username: 'superadmin',
      email: 'kidayos2014@gmail.com',
      password: 'password',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      permissions: [
        'manage_users', 'manage_medicines', 'manage_prescriptions', 
        'view_reports', 'manage_settings', 'manage_billing',
        'dispense_medicines', 'create_prescriptions', 'view_inventory'
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
    };
    
    const superAdmin = await MultiTenantUser.create(superAdminData);
    console.log('✅ Created super admin:', superAdmin.email);
    
    // Create regular admin with username
    const adminData = {
      tenantId: tenant._id,
      username: 'pharmacist',
      email: 'pharmacist@demopharmacy.com',
      password: 'pharmacist123',
      firstName: 'John',
      lastName: 'Pharmacist',
      role: 'admin',
      permissions: [
        'manage_medicines', 'manage_prescriptions', 
        'view_reports', 'dispense_medicines', 'create_prescriptions', 'view_inventory'
      ],
      profile: {
        phone: '+1234567891',
        licenseNumber: 'PH123456'
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
    };
    
    const regularAdmin = await MultiTenantUser.create(adminData);
    console.log('✅ Created regular admin:', regularAdmin.email);
    
    console.log('🎉 Users fixed successfully!');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Super Admin:');
    console.log('     Email: kidayos2014@gmail.com');
    console.log('     Password: password');
    console.log('   Regular Admin:');
    console.log('     Email: pharmacist@demopharmacy.com');
    console.log('     Password: pharmacist123');
    
  } catch (error) {
    console.error('❌ Error fixing users:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

fixUsers();