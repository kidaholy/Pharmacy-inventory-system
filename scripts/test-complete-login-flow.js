const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testCompleteLoginFlow() {
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
    
    // Simulate exact login flow
    const email = 'sosi@sosi.com';
    const password = 'password123';
    
    console.log('🔍 Login attempt for:', email);
    console.log('🔍 Password:', password);
    
    // Get tenants (same as API)
    const tenants = await Tenant.find({ isActive: true }).sort({ createdAt: -1 });
    console.log('📋 Found tenants:', tenants.length);
    
    for (const tenant of tenants) {
      console.log(`\n🔍 Checking tenant: ${tenant.name} (ID: ${tenant._id})`);
      
      // Step 1: Convert tenantId to ObjectId
      const tenantObjectId = new mongoose.Types.ObjectId(tenant._id.toString());
      console.log('🔄 Converted to ObjectId:', tenantObjectId);
      
      // Step 2: Find user
      const user = await MultiTenantUser.findOne({
        tenantId: tenantObjectId,
        email: email,
        isActive: true
      });
      
      console.log('👤 User found:', user ? 'YES' : 'NO');
      
      if (user) {
        console.log('👤 User details:');
        console.log('   Email:', user.email);
        console.log('   TenantId:', user.tenantId);
        console.log('   IsActive:', user.isActive);
        console.log('   Role:', user.role);
        console.log('   Has password:', !!user.password);
        
        // Step 3: Check if user is locked
        const isLocked = user.security && user.security.lockedUntil && user.security.lockedUntil > new Date();
        console.log('🔒 User locked:', isLocked ? 'YES' : 'NO');
        
        if (!isLocked) {
          // Step 4: Verify password
          console.log('🔐 Testing password verification...');
          const isPasswordValid = await bcrypt.compare(password, user.password);
          console.log('🔐 Password valid:', isPasswordValid ? 'YES' : 'NO');
          
          if (isPasswordValid) {
            console.log('✅ LOGIN SUCCESS for tenant:', tenant.name);
            console.log('✅ User would be authenticated and logged in');
            return;
          } else {
            console.log('❌ Password verification failed');
          }
        } else {
          console.log('❌ User account is locked');
        }
      } else {
        console.log('❌ No user found for this tenant');
      }
    }
    
    console.log('\n❌ Authentication failed - no valid user found');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

testCompleteLoginFlow();