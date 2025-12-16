const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkDatabaseContents() {
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
    
    // Get all tenants
    const tenants = await Tenant.find({});
    console.log(`\n📋 Found ${tenants.length} tenants:`);
    
    tenants.forEach((tenant, index) => {
      console.log(`\n${index + 1}. Tenant Details:`);
      console.log(`   ID: ${tenant._id}`);
      console.log(`   Name: ${tenant.name}`);
      console.log(`   Subdomain: ${tenant.subdomain}`);
      console.log(`   Owner ID: ${tenant.ownerId}`);
      console.log(`   Subscription: ${tenant.subscriptionPlan} (${tenant.subscriptionStatus})`);
      console.log(`   Contact Email: ${tenant.contact?.email}`);
      console.log(`   Phone: ${tenant.contact?.phone}`);
      console.log(`   Address: ${tenant.contact?.address}`);
      console.log(`   City: ${tenant.contact?.city}, ${tenant.contact?.state}, ${tenant.contact?.country}`);
      console.log(`   Postal Code: ${tenant.contact?.postalCode}`);
      console.log(`   Active: ${tenant.isActive}`);
      console.log(`   Created: ${tenant.createdAt}`);
    });
    
    // Get all users
    const users = await MultiTenantUser.find({});
    console.log(`\n👥 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User Details:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Tenant ID: ${user.tenantId}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Email Verified: ${user.isEmailVerified}`);
      console.log(`   Created: ${user.createdAt}`);
      
      // Find matching tenant
      if (!user.tenantId || user.tenantId === null) {
        console.log(`   👑 Super Admin (tenant-independent)`);
      } else {
        const matchingTenant = tenants.find(t => t._id.toString() === user.tenantId.toString());
        if (matchingTenant) {
          console.log(`   ✅ Belongs to tenant: ${matchingTenant.name} (${matchingTenant.subdomain})`);
        } else {
          console.log(`   ❌ Orphaned user - tenant not found`);
        }
      }
    });
    
    // Summary
    console.log(`\n📊 Database Summary:`);
    console.log(`   Total Tenants: ${tenants.length}`);
    console.log(`   Active Tenants: ${tenants.filter(t => t.isActive).length}`);
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Active Users: ${users.filter(u => u.isActive).length}`);
    console.log(`   Super Admins: ${users.filter(u => u.role === 'super_admin').length}`);
    console.log(`   Regular Admins: ${users.filter(u => u.role === 'admin').length}`);
    
    // Check for issues
    const orphanedUsers = users.filter(u => {
      if (!u.tenantId || u.tenantId === null) return false; // Super admin
      return !tenants.find(t => t._id.toString() === u.tenantId.toString());
    });
    
    if (orphanedUsers.length > 0) {
      console.log(`\n⚠️  Found ${orphanedUsers.length} orphaned users (users without matching tenants)`);
    }
    
    const tenantsWithoutOwners = tenants.filter(t => {
      return !users.find(u => u._id.toString() === t.ownerId.toString());
    });
    
    if (tenantsWithoutOwners.length > 0) {
      console.log(`\n⚠️  Found ${tenantsWithoutOwners.length} tenants without owners`);
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

checkDatabaseContents();