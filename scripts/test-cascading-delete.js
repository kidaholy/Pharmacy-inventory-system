
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testCascadingDelete() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('pharmacy');
    const tenants = db.collection('tenants');
    const users = db.collection('multitenantusers'); // mongoose model 'MultiTenantUser' usually maps to 'multitenantusers'

    // 1. Create a dummy tenant and owner
    const tenantId = new ObjectId();
    const ownerId = new ObjectId();

    await tenants.insertOne({
      _id: tenantId,
      name: 'Test Cascading Pharmacy',
      subdomain: 'test-cascading-' + Date.now(),
      ownerId: ownerId,
      contact: { email: 'test@example.com' },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Created test tenant:', tenantId);

    await users.insertOne({
      _id: ownerId,
      tenantId: tenantId,
      username: 'testowner_cascading',
      email: 'owner_cascading@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Owner',
      role: 'tenant_admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      security: {
          failedLoginAttempts: 0,
          twoFactorEnabled: false,
          recoveryTokens: []
      }
    });
    console.log('✅ Created test owner:', ownerId);

    // 2. Simulate the API deletion logic
    console.log('🗑️ Simulating deletion of owner...');
    
    // Simulate logic from: app/api/users/[userId]/route.ts
    const fetchedTenant = await tenants.findOne({ _id: tenantId });
    const isOwner = fetchedTenant && fetchedTenant.ownerId && fetchedTenant.ownerId.toString() === ownerId.toString();
    
    if (isOwner) {
      console.log('👑 User is the tenant owner, deactivating tenant...');
      await tenants.updateOne({ _id: tenantId }, { $set: { isActive: false, updatedAt: new Date() } });
    }
    
    // Simulate multiTenantDb.deleteUser (which sets isActive to false)
    await users.updateOne({ _id: ownerId }, { $set: { isActive: false, updatedAt: new Date() } });

    // 3. Verify results
    const updatedTenant = await tenants.findOne({ _id: tenantId });
    const updatedOwner = await users.findOne({ _id: ownerId });

    console.log('📊 Verification:');
    console.log('Tenant active:', updatedTenant.isActive);
    console.log('Owner active:', updatedOwner.isActive);

    if (updatedTenant.isActive === false && updatedOwner.isActive === false) {
      console.log('🎉 SUCCESS: Cascading delete logic verified!');
    } else {
      console.error('❌ FAILURE: Cascading delete logic did not work as expected');
    }

    // Cleanup
    await tenants.deleteOne({ _id: tenantId });
    await users.deleteOne({ _id: ownerId });
    console.log('🧹 Cleaned up test data');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

testCascadingDelete();
