const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function debugUsers() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Check tenants
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    const tenants = await Tenant.find({});
    console.log('\n📋 Tenants:');
    tenants.forEach(tenant => {
      console.log(`   - ${tenant.name} (${tenant.subdomain}) - ID: ${tenant._id}`);
    });
    
    // Check users
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    const users = await MultiTenantUser.find({});
    console.log('\n👥 Users:');
    users.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName}`);
      console.log(`     Email: ${user.email}`);
      console.log(`     Password: ${user.password}`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Tenant ID: ${user.tenantId}`);
      console.log(`     Active: ${user.isActive}`);
      console.log('');
    });
    
    // Test authentication manually
    console.log('🔍 Testing authentication for kidayos2014@gmail.com...');
    const testUser = await MultiTenantUser.findOne({ 
      email: 'kidayos2014@gmail.com',
      password: 'password',
      isActive: true 
    });
    
    if (testUser) {
      console.log('✅ Direct database query found user:', testUser.email);
    } else {
      console.log('❌ Direct database query did not find user');
      
      // Check if user exists with different criteria
      const userByEmail = await MultiTenantUser.findOne({ email: 'kidayos2014@gmail.com' });
      if (userByEmail) {
        console.log('🔍 User exists but with different password or status:');
        console.log('   Password in DB:', userByEmail.password);
        console.log('   Active status:', userByEmail.isActive);
      } else {
        console.log('❌ User does not exist at all');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

debugUsers();