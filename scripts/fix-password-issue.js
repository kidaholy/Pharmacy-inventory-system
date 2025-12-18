const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function fixPasswordIssue() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    
    // Get the user that's failing
    const user = await MultiTenantUser.findOne({ email: 'sosi@sosi.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 Current user details:');
    console.log('   Email:', user.email);
    console.log('   Password hash length:', user.password.length);
    console.log('   Password starts with:', user.password.substring(0, 10) + '...');
    
    // Test current password
    const testPasswords = ['password123', 'password', 'sosi123', 'admin123'];
    
    console.log('\n🔐 Testing possible passwords:');
    for (const testPwd of testPasswords) {
      const isValid = await bcrypt.compare(testPwd, user.password);
      console.log(`   "${testPwd}": ${isValid ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
    
    // Reset password to known value
    console.log('\n🔄 Resetting password to "password123"...');
    const newHashedPassword = await bcrypt.hash('password123', 12);
    
    await MultiTenantUser.findByIdAndUpdate(user._id, {
      password: newHashedPassword,
      'security.lastPasswordChange': new Date(),
      'security.failedLoginAttempts': 0,
      'security.lockedUntil': undefined
    });
    
    console.log('✅ Password reset complete');
    
    // Verify the new password
    const updatedUser = await MultiTenantUser.findById(user._id);
    const isNewPasswordValid = await bcrypt.compare('password123', updatedUser.password);
    console.log('✅ New password verification:', isNewPasswordValid ? 'SUCCESS' : 'FAILED');
    
    // Also fix the other user
    console.log('\n--- Fixing eyob@gmail.com ---');
    const user2 = await MultiTenantUser.findOne({ email: 'eyob@gmail.com' });
    
    if (user2) {
      await MultiTenantUser.findByIdAndUpdate(user2._id, {
        password: newHashedPassword,
        'security.lastPasswordChange': new Date(),
        'security.failedLoginAttempts': 0,
        'security.lockedUntil': undefined
      });
      
      console.log('✅ eyob@gmail.com password also reset');
    }
    
    console.log('\n🎉 Password fix complete!');
    console.log('🔐 Both users can now login with: password123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

fixPasswordIssue();