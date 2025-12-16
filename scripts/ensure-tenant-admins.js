const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function ensureTenantAdmins() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get all tenants and users
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    
    const tenants = await Tenant.find({});
    console.log('📋 Found tenants:', tenants.length);
    
    for (const tenant of tenants) {
      console.log(`\n🔍 Checking tenant: ${tenant.name} (${tenant.subdomain})`);
      
      // Check if tenant has any admin users
      const adminUsers = await MultiTenantUser.find({
        tenantId: tenant._id,
        role: { $in: ['admin', 'tenant_admin'] },
        isActive: true
      });
      
      console.log(`   Found ${adminUsers.length} admin users`);
      
      if (adminUsers.length === 0) {
        console.log('   ⚠️  No admin users found! Creating default admin...');
        
        // Create a default admin user for this tenant
        const adminData = {
          tenantId: tenant._id,
          username: `${tenant.subdomain}_admin`,
          email: `admin@${tenant.subdomain}.com`,
          password: 'admin123', // Should be changed on first login
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          permissions: [
            'manage_users', 'manage_medicines', 'manage_prescriptions', 
            'view_reports', 'manage_settings',
            'dispense_medicines', 'create_prescriptions', 'view_inventory'
          ],
          profile: {
            phone: tenant.contact?.phone || '+1234567890'
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
        };
        
        const newAdmin = await MultiTenantUser.create(adminData);
        console.log(`   ✅ Created admin user: ${newAdmin.email}`);
      } else {
        console.log('   ✅ Tenant has admin users');
        adminUsers.forEach(admin => {
          console.log(`      - ${admin.firstName} ${admin.lastName} (${admin.email}) - ${admin.role}`);
        });
      }
    }
    
    console.log('\n🎉 Tenant admin validation completed!');
    console.log('\n📋 Summary:');
    
    // Show final summary
    for (const tenant of tenants) {
      const adminUsers = await MultiTenantUser.find({
        tenantId: tenant._id,
        role: { $in: ['admin', 'tenant_admin'] },
        isActive: true
      });
      
      console.log(`   ${tenant.name}: ${adminUsers.length} admin(s)`);
      adminUsers.forEach(admin => {
        console.log(`      - ${admin.email} (${admin.role})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error ensuring tenant admins:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

ensureTenantAdmins();