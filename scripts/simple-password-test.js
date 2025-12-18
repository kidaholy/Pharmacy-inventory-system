const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function simplePasswordTest() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    
    // Get the user
    const user = await MultiTenantUser.findOne({ email: 'sosi@sosi.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    const testPassword = 'password123';
    
    console.log('🔐 Current password verification:');
    const currentTest = await bcrypt.compare(testPassword, user.password);
    console.log('   Current password test:', currentTest ? '✅ SUCCESS' : '❌ FAILED');
    
    if (!currentTest) {
      console.log('\n🔄 Creating and setting new password hash...');
      
      // Create a fresh hash with salt rounds 12 (same as PasswordUtils)
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log('   New hash created, length:', newHash.length);
      
      // Update the user
      await MultiTenantUser.findByIdAndUpdate(user._id, {
        password: newHash,
        'security.failedLoginAttempts': 0,
        'security.lockedUntil': undefined,
        'security.lastPasswordChange': new Date()
      });
      
      console.log('✅ Password updated in database');
      
      // Verify the update worked
      const updatedUser = await MultiTenantUser.findById(user._id);
      const verifyTest = await bcrypt.compare(testPassword, updatedUser.password);
      console.log('   Verification test:', verifyTest ? '✅ SUCCESS' : '❌ FAILED');
    }
    
    // Also fix eyob@gmail.com
    console.log('\n--- Fixing eyob@gmail.com ---');
    const user2 = await MultiTenantUser.findOne({ email: 'eyob@gmail.com' });
    
    if (user2) {
      const newHash2 = await bcrypt.hash(testPassword, 12);
      await MultiTenantUser.findByIdAndUpdate(user2._id, {
        password: newHash2,
        'security.failedLoginAttempts': 0,
        'security.lockedUntil': undefined,
        'security.lastPasswordChange': new Date()
      });
      
      console.log('✅ eyob@gmail.com password also updated');
    }
    
    console.log('\n🎉 Password fix complete!');
    console.log('🔐 Try logging in now with: password123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

simplePasswordTest();