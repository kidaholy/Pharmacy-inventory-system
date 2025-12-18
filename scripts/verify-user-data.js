const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function verifyUserData() {
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
    
    // Get tenant data
    const tenants = await Tenant.find({ isActive: true });
    console.log('📋 Tenants:');
    for (const tenant of tenants) {
      console.log(`   ${tenant.name}: ${tenant._id} (${typeof tenant._id})`);
    }
    
    console.log('\n👥 Users:');
    const users = await MultiTenantUser.find({ email: { $in: ['sosi@sosi.com', 'eyob@gmail.com'] } });
    
    for (const user of users) {
      console.log(`   ${user.email}:`);
      console.log(`      tenantId: ${user.tenantId} (${typeof user.tenantId})`);
      console.log(`      isActive: ${user.isActive}`);
      console.log(`      role: ${user.role}`);
      
      // Find matching tenant
      const matchingTenant = tenants.find(t => t._id.equals(user.tenantId));
      console.log(`      tenant: ${matchingTenant ? matchingTenant.name : 'NOT FOUND'}`);
      
      // Test the exact query that should work
      console.log(`      Testing query with ObjectId...`);
      const testUser = await MultiTenantUser.findOne({
        tenantId: user.tenantId,
        email: user.email,
        isActive: true
      });
      console.log(`      Query result: ${testUser ? 'SUCCESS' : 'FAILED'}`);
      
      // Test with string conversion
      console.log(`      Testing query with string conversion...`);
      const tenantObjectId = new mongoose.Types.ObjectId(user.tenantId.toString());
      const testUser2 = await MultiTenantUser.findOne({
        tenantId: tenantObjectId,
        email: user.email,
        isActive: true
      });
      console.log(`      Query result: ${testUser2 ? 'SUCCESS' : 'FAILED'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

verifyUserData();