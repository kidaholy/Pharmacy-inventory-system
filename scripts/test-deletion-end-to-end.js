const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testDeletionEndToEnd() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
const db = client.db('pharmacy');
    const tenants = db.collection('tenants');
    const users = db.collection('multitenantusers');

    // Test 1: Create and delete a user WITH a tenant (regular admin)
    console.log('TEST 1: User WITH tenant');
    console.log('='.repeat(80));
    
    const tenantId1 = new ObjectId();
    const ownerId1 = new ObjectId();
    
    await tenants.insertOne({
      _id: tenantId1,
      name: 'Test Tenant 1',
      subdomain: 'test-tenant-1-' + Date.now(),
      ownerId: ownerId1,
      contact: { email: 'test1@example.com' },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await users.insertOne({
      _id: ownerId1,
      tenantId: tenantId1,
      username: 'testowner1',
      email: 'testowner1@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Owner1',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      security: { failedLoginAttempts: 0, twoFactorEnabled: false, recoveryTokens: [] }
    });
    
    console.log('✅ Created tenant and user');
    
    // Simulate getUserById with valid tenantId
    let query1 = { _id: ownerId1 };
    const testTenantId1 = tenantId1.toString();
    if (testTenantId1 && testTenantId1 !== 'null' && testTenantId1 !== 'undefined') {
      query1.tenantId = new ObjectId(testTenantId1);
    } else {
      query1.tenantId = null;
    }
    
    const foundUser1 = await users.findOne(query1);
    console.log('Found user:', foundUser1 ? 'YES' : 'NO');
    
    if (foundUser1) {
      // Check if user is tenant owner and deactivate tenant
      const tenant1 = await tenants.findOne({ _id: tenantId1 });
      const isOwner1 = tenant1 && tenant1.ownerId && tenant1.ownerId.toString() === ownerId1.toString();
      
      if (isOwner1) {
        console.log('👑  User is tenant owner, deactivating tenant...');
        await tenants.updateOne({ _id: tenantId1 }, { $set: { isActive: false } });
      }
      
      // Delete user
      await users.updateOne({ _id: ownerId1 }, { $set: { isActive: false } });
      console.log('✅ User deleted');
      
      const verifyTenant1 = await tenants.findOne({ _id: tenantId1 });
      const verifyUser1 = await users.findOne({ _id: ownerId1 });
      
      console.log('Tenant deactivated:', !verifyTenant1?.isActive);
      console.log('User deactivated:', !verifyUser1?.isActive);
      
      if (!verifyTenant1?.isActive && !verifyUser1?.isActive) {
        console.log('🎉 SUCCESS: Cascading delete worked!\n');
      } else {
        console.error('❌ FAILED: Cascading delete did not work\n');
      }
    }
    
    // Test 2: Create and delete a user WITHOUT a tenant (super admin)
    console.log('\nTEST 2: User WITHOUT tenant (Super Admin)');
    console.log('='.repeat(80));
    
    const userId2 = new ObjectId();
    
    await users.insertOne({
      _id: userId2,
      tenantId: null,
      username: 'testsuperadmin',
      email: 'testsuperadmin@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'SuperAdmin',
      role: 'super_admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      security: { failedLoginAttempts: 0, twoFactorEnabled: false, recoveryTokens: [] }
    });
    
    console.log('✅ Created super admin');
    
    // Simulate getUserById with null tenantId
    let query2 = { _id: userId2 };
    const testTenantId2 = null;
    if (testTenantId2 && testTenantId2 !== 'null' && testTenantId2 !== 'undefined') {
      query2.tenantId = new ObjectId(testTenantId2);
    } else {
      query2.tenantId = null;
    }
    
    const foundUser2 = await users.findOne(query2);
    console.log('Found user:', foundUser2 ? 'YES' : 'NO');
    
    if (foundUser2) {
      // Delete user
      await users.updateOne({ _id: userId2 }, { $set: { isActive: false } });
      console.log('✅ User deleted');
      
      const verifyUser2 = await users.findOne({ _id: userId2 });
      console.log('User deactivated:', !verifyUser2?.isActive);
      
      if (!verifyUser2?.isActive) {
        console.log('🎉 SUCCESS: Super admin deletion worked!\n');
      } else {
        console.error('❌ FAILED: Super admin deletion did not work\n');
      }
    }
    
    // Cleanup
    await tenants.deleteOne({ _id: tenantId1 });
    await users.deleteMany({ _id: { $in: [ownerId1, userId2] } });
    console.log('🧹 Cleaned up test data');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

testDeletionEndToEnd();
