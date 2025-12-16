const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testLoginAPI() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    
    // Test credentials
    const testCredentials = [
      { email: 'kidayos2014@gmail.com', password: 'password123' },
      { email: 'sosi@sosi.com', password: 'password123' },
      { email: 'eyob@gmail.com', password: 'password123' }
    ];
    
    console.log('🧪 Testing login logic for each user...\n');
    
    for (const cred of testCredentials) {
      console.log(`🔍 Testing login for: ${cred.email}`);
      
      // Check if this is the super admin
      if (cred.email === 'kidayos2014@gmail.com') {
        console.log('   👑 Super admin login attempt');
        
        const superAdminUser = await MultiTenantUser.findOne({ 
          email: cred.email,
          role: 'super_admin'
        });
        
        if (superAdminUser && superAdminUser.isActive) {
          const isPasswordValid = await bcrypt.compare(cred.password, superAdminUser.password);
          console.log(`   Password verification: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);
          
          if (isPasswordValid) {
            console.log('   ✅ Super admin authentication SUCCESS');
          } else {
            console.log('   ❌ Super admin authentication FAILED');
          }
        } else {
          console.log('   ❌ Super admin user not found or inactive');
        }
      } else {
        // For regular users, check within tenants
        console.log('   👤 Regular user login attempt');
        
        const tenants = await Tenant.find({});
        console.log(`   📋 Found ${tenants.length} tenants to check`);
        
        let userFound = false;
        
        for (const tenant of tenants) {
          console.log(`   🔍 Checking tenant: ${tenant.name} (${tenant.subdomain})`);
          
          const user = await MultiTenantUser.findOne({
            tenantId: tenant._id,
            email: cred.email,
            isActive: true
          });
          
          if (user) {
            console.log(`   👤 User found in tenant: ${tenant.name}`);
            const isPasswordValid = await bcrypt.compare(cred.password, user.password);
            console.log(`   Password verification: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);
            
            if (isPasswordValid) {
              console.log(`   ✅ User authentication SUCCESS`);
              console.log(`   🌐 Should redirect to: /${tenant.subdomain}/dashboard`);
              userFound = true;
              break;
            }
          }
        }
        
        if (!userFound) {
          console.log('   ❌ User not found in any tenant');
        }
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Test the actual API call
    console.log('🌐 Testing actual API call...');
    
    try {
      const response = await fetch('https://pharmacy-inventory-system-gilt.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'sosi@sosi.com',
          password: 'password123'
        }),
      });
      
      const result = await response.json();
      console.log('API Response Status:', response.status);
      console.log('API Response:', result);
      
    } catch (apiError) {
      console.log('❌ API call failed:', apiError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

testLoginAPI();