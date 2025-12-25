
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testCompleteDeleteFix() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('pharmacy');
    const users = db.collection('multitenantusers');

    // Test 1: User with null tenantId (super admin)
    const userId1 = new ObjectId();
    await users.insertOne({
      _id: userId1,
      tenantId: null,
      username: 'test_super_admin',
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
    console.log('✅ Created test super admin:', userId1);

    // Test 2: User with valid tenantId
    const tenantId = new ObjectId();
    const userId2 = new ObjectId();
    await users.insertOne({
      _id: userId2,
      tenantId: tenantId,
      username: 'test_tenant_user',
      email: 'testtenantuser@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'TenantUser',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      security: { failedLoginAttempts: 0, twoFactorEnabled: false, recoveryTokens: [] }
    });
    console.log('✅ Created test tenant user:', userId2);

    // Simulate the fixed deleteUser function logic
    console.log('\n🗑️ Testing deletion with NULL tenantId...');
    let query1 = { _id: userId1 };
    const testTenantId1 = null;
    if (testTenantId1 && testTenantId1 !== 'null' && testTenantId1 !== 'undefined') {
      query1.tenantId = new ObjectId(testTenantId1);
    } else {
      query1.tenantId = null;
    }
    const result1 = await users.findOneAndUpdate(query1, { $set: { isActive: false } }, { returnDocument: 'after' });
    console.log('Result 1:', result1 ? 'SUCCESS' : 'FAILED');

    console.log('\n🗑️ Testing deletion with VALID tenantId...');
    let query2 = { _id: userId2 };
    const testTenantId2 = tenantId.toString();
    if (testTenantId2 && testTenantId2 !== 'null' && testTenantId2 !== 'undefined') {
      query2.tenantId = new ObjectId(testTenantId2);
    } else {
      query2.tenantId = null;
    }
    const result2 = await users.findOneAndUpdate(query2, { $set: { isActive: false } }, { returnDocument: 'after' });
    console.log('Result 2:', result2 ? 'SUCCESS' : 'FAILED');

    // Verify
    console.log('\n📊 Verification:');
    const verifyUser1 = await users.findOne({ _id: userId1 });
    const verifyUser2 = await users.findOne({ _id: userId2 });
    console.log('Super admin deleted:', !verifyUser1?.isActive);
    console.log('Tenant user deleted:', !verifyUser2?.isActive);

    if (!verifyUser1?.isActive && !verifyUser2?.isActive) {
      console.log('\n🎉 SUCCESS: Both deletion scenarios work correctly!');
    } else {
      console.error('\n❌ FAILURE: Deletion did not work as expected');
    }

    // Cleanup
    await users.deleteMany({ _id: { $in: [userId1, userId2] } });
    console.log('🧹 Cleaned up test data');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

testCompleteDeleteFix();
