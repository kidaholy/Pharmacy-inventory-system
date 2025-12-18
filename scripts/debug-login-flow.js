const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function debugLoginFlow() {
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
    
    // Simulate the exact login flow
    const email = 'sosi@sosi.com';
    const password = 'password123';
    
    console.log('🔍 Login attempt for:', email);
    
    // Get all tenants (same as login API)
    const tenants = await Tenant.find({ isActive: true }).sort({ createdAt: -1 });
    console.log('📋 Found tenants:', tenants.length);
    
    for (const tenant of tenants) {
      console.log('🔍 Checking tenant:', tenant.name, 'ID:', tenant._id.toString());
      
      // This is the exact same query as getUserByCredentials
      const user = await MultiTenantUser.findOne({
        tenantId: tenant._id.toString(), // This might be the issue!
        email: email,
        isActive: true
      });
      
      console.log('👤 User query result:', user ? 'FOUND' : 'NOT FOUND');
      
      if (user) {
        console.log('👤 User details:', {
          email: user.email,
          tenantId: user.tenantId,
          tenantIdType: typeof user.tenantId,
          isActive: user.isActive
        });
        
        // Check if tenantId matches
        console.log('🔍 Tenant ID comparison:');
        console.log('   Tenant._id:', tenant._id);
        console.log('   Tenant._id.toString():', tenant._id.toString());
        console.log('   User.tenantId:', user.tenantId);
        console.log('   User.tenantId.toString():', user.tenantId.toString());
        console.log('   Match (string):', user.tenantId.toString() === tenant._id.toString());
        console.log('   Match (ObjectId):', user.tenantId.equals ? user.tenantId.equals(tenant._id) : 'N/A');
        
        // Test password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('🔐 Password valid:', isPasswordValid);
        
        if (isPasswordValid) {
          console.log('✅ LOGIN SUCCESS for tenant:', tenant.name);
          break;
        }
      } else {
        // Let's try with ObjectId
        console.log('🔍 Trying with ObjectId...');
        const userWithObjectId = await MultiTenantUser.findOne({
          tenantId: tenant._id, // Use ObjectId directly
          email: email,
          isActive: true
        });
        
        console.log('👤 User query with ObjectId result:', userWithObjectId ? 'FOUND' : 'NOT FOUND');
        
        if (userWithObjectId) {
          const isPasswordValid = await bcrypt.compare(password, userWithObjectId.password);
          console.log('🔐 Password valid (ObjectId query):', isPasswordValid);
          
          if (isPasswordValid) {
            console.log('✅ LOGIN SUCCESS with ObjectId for tenant:', tenant.name);
            break;
          }
        }
      }
    }
    
    // Let's also check what tenantId format is stored in the user
    console.log('\n--- Checking all users and their tenantId formats ---');
    const allUsers = await MultiTenantUser.find({ email: { $in: ['sosi@sosi.com', 'eyob@gmail.com'] } });
    
    for (const user of allUsers) {
      console.log(`👤 ${user.email}:`);
      console.log('   tenantId:', user.tenantId);
      console.log('   tenantId type:', typeof user.tenantId);
      console.log('   tenantId constructor:', user.tenantId.constructor.name);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

debugLoginFlow();