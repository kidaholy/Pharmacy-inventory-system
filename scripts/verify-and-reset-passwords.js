const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function verifyAndResetPasswords() {
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
    
    // Test password
    const testPassword = 'password123';
    
    console.log('🔍 Checking current password status...');
    
    // Get all users
    const users = await MultiTenantUser.find({});
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.email} (${user.role})`);
      
      // Test current password
      const isCurrentPasswordValid = await bcrypt.compare(testPassword, user.password);
      console.log(`   Current password test: ${isCurrentPasswordValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (!isCurrentPasswordValid) {
        console.log('   🔄 Resetting password...');
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        
        // Update user
        await MultiTenantUser.findByIdAndUpdate(user._id, {
          password: hashedPassword,
          'security.lastPasswordChange': new Date(),
          'security.failedLoginAttempts': 0,
          'security.lockedUntil': undefined
        });
        
        // Verify the update worked
        const updatedUser = await MultiTenantUser.findById(user._id);
        const isNewPasswordValid = await bcrypt.compare(testPassword, updatedUser.password);
        console.log(`   New password test: ${isNewPasswordValid ? '✅ SUCCESS' : '❌ FAILED'}`);
      }
      
      // Get tenant info if applicable
      if (user.tenantId) {
        const tenant = await Tenant.findById(user.tenantId);
        if (tenant) {
          console.log(`   🏥 Tenant: ${tenant.name} (${tenant.subdomain})`);
          console.log(`   🌐 Dashboard: https://pharmacy-inventory-system-gilt.vercel.app/${tenant.subdomain}/dashboard`);
        }
      } else {
        console.log(`   👑 Super Admin - System Dashboard`);
      }
    }
    
    console.log('\n🎉 Password verification and reset complete!');
    console.log('\n🔐 Login Credentials:');
    console.log('   Password for ALL users: password123');
    console.log('\n👥 Available Login Emails:');
    
    for (const user of users) {
      console.log(`   📧 ${user.email}`);
    }
    
    console.log('\n🌐 Login URL: https://pharmacy-inventory-system-gilt.vercel.app/login');
    
    // Test the authentication logic manually
    console.log('\n🧪 Testing authentication logic...');
    
    for (const user of users) {
      const passwordMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`   ${user.email}: ${passwordMatch ? '✅ AUTH READY' : '❌ AUTH FAILED'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

verifyAndResetPasswords();