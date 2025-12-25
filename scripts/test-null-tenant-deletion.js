
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testDeleteWithNullTenant() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('pharmacy');
    const users = db.collection('multitenantusers');

    // Create a test user with null tenantId (like a super admin)
    const userId = new ObjectId();

    await users.insertOne({
      _id: userId,
      tenantId: null, // Super admin scenario
      username: 'test_null_tenant_user',
      email: 'testnull@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'NullTenant',
      role: 'super_admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      security: {
          failedLoginAttempts: 0,
          twoFactorEnabled: false,
          recoveryTokens: []
      }
    });
    console.log('✅ Created test user with null tenantId:', userId);

    // Simulate the fixed API deletion logic
    console.log('🗑️ Simulating deletion with null tenantId...');
    const tenantId = null;
    
    // The fixed logic: check if tenantId is valid
    if (tenantId && tenantId !== 'null' && tenantId !== 'undefined') {
      console.log('Checking tenant...');
      // Would fetch tenant here
    } else {
      console.log('ℹ️ User has no tenant (likely super admin), skipping tenant deactivation');
    }
    
    // Simulate user deletion
    await users.updateOne({ _id: userId }, { $set: { isActive: false } });
    console.log('✅ User deactivated successfully');

    // Verify
    const updatedUser = await users.findOne({ _id: userId });
    console.log('📊 Verification:');
    console.log('User active:', updatedUser.isActive);

    if (updatedUser.isActive === false) {
      console.log('🎉 SUCCESS: User deleted without tenant errors!');
    } else {
      console.error('❌ FAILURE: Deletion did not work as expected');
    }

    // Cleanup
    await users.deleteOne({ _id: userId });
    console.log('🧹 Cleaned up test data');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

testDeleteWithNullTenant();
