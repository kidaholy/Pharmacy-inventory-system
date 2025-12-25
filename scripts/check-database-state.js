const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkDatabaseState() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('pharmacy');
    
    // Check tenants
    const tenants = await db.collection('tenants').find({}).toArray();
    console.log('📊 TENANTS (' + tenants.length + ' total):');
    console.log('='.repeat(80));
    tenants.forEach(tenant => {
      console.log(`\nID: ${tenant._id}`);
      console.log(`Name: ${tenant.name}`);
      console.log(`Subdomain: ${tenant.subdomain}`);
      console.log(`Owner ID: ${tenant.ownerId}`);
      console.log(`Active: ${tenant.isActive}`);
      console.log(`Plan: ${tenant.subscriptionPlan}`);
    });
    
    // Check users
    const users = await db.collection('multitenantusers').find({}).toArray();
    console.log('\n\n👥 USERS (' + users.length + ' total):');
    console.log('='.repeat(80));
    users.forEach(user => {
      console.log(`\nID: ${user._id}`);
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Tenant ID: ${user.tenantId === null ? 'NULL (Super Admin)' : user.tenantId}`);
      console.log(`Active: ${user.isActive}`);
    });
    
    // Check for orphaned users (users whose tenant doesn't exist)
    console.log('\n\n🔍 ORPHANED USERS CHECK:');
    console.log('='.repeat(80));
    const tenantIds = new Set(tenants.map(t => t._id.toString()));
    const orphanedUsers = users.filter(u => u.tenantId !== null && !tenantIds.has(u.tenantId.toString()));
    if (orphanedUsers.length > 0) {
      console.log(`⚠️ Found ${orphanedUsers.length} orphaned users:`);
      orphanedUsers.forEach(u => {
        console.log(`  - ${u.firstName} ${u.lastName} (${u.email}) - Tenant ID: ${u.tenantId}`);
      });
    } else {
      console.log('✅ No orphaned users found');
    }
    
    // Check for users without tenants (should be super admins)
    console.log('\n\n👑 USERS WITHOUT TENANTS:');
    console.log('='.repeat(80));
    const noTenantUsers = users.filter(u => u.tenantId === null);
    if (noTenantUsers.length > 0) {
      noTenantUsers.forEach(u => {
        console.log(`  - ${u.firstName} ${u.lastName} (${u.email}) - Role: ${u.role}`);
      });
    } else {
      console.log('No users without tenants');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

checkDatabaseState();
