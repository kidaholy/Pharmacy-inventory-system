const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testLoginFix() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Import the fixed multi-tenant service
    const { multiTenantDb } = require('../lib/services/multi-tenant-db.ts');
    
    // Test the getUserByCredentials method
    const tenants = await multiTenantDb.getAllTenants();
    console.log('📋 Found tenants:', tenants.length);
    
    for (const tenant of tenants) {
      console.log('🔍 Testing tenant:', tenant.name);
      
      // Test with sosi@sosi.com
      if (tenant.name === 'Tade Pharamcy') {
        const user = await multiTenantDb.getUserByCredentials(tenant._id.toString(), 'sosi@sosi.com', 'password123');
        console.log('👤 sosi@sosi.com login result:', user ? 'SUCCESS' : 'FAILED');
      }
      
      // Test with eyob@gmail.com
      if (tenant.name === 'Yosef pharmacy') {
        const user = await multiTenantDb.getUserByCredentials(tenant._id.toString(), 'eyob@gmail.com', 'password123');
        console.log('👤 eyob@gmail.com login result:', user ? 'SUCCESS' : 'FAILED');
      }
    }
    
    console.log('🎉 Login fix test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

testLoginFix();