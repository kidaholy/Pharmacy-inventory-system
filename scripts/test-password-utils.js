const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Import the PasswordUtils to test it
const { PasswordUtils } = require('../lib/password-utils.ts');

const MONGODB_URI = process.env.MONGODB_URI;

async function testPasswordUtils() {
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
    
    console.log('🔐 Testing password verification methods:');
    
    // Test 1: Direct bcrypt.compare
    const directBcrypt = await bcrypt.compare(testPassword, user.password);
    console.log('   Direct bcrypt.compare:', directBcrypt ? '✅ SUCCESS' : '❌ FAILED');
    
    // Test 2: PasswordUtils.verifyPassword
    const passwordUtils = await PasswordUtils.verifyPassword(testPassword, user.password);
    console.log('   PasswordUtils.verifyPassword:', passwordUtils ? '✅ SUCCESS' : '❌ FAILED');
    
    // Test 3: Check password hash format
    console.log('\n🔍 Password hash analysis:');
    console.log('   Hash length:', user.password.length);
    console.log('   Hash format:', user.password.substring(0, 7));
    console.log('   Is bcrypt hash:', user.password.startsWith('$2b$') || user.password.startsWith('$2a$'));
    
    // Test 4: Create new hash and compare
    console.log('\n🔄 Creating fresh hash:');
    const newHash = await bcrypt.hash(testPassword, 12);
    const newHashTest = await bcrypt.compare(testPassword, newHash);
    console.log('   Fresh hash test:', newHashTest ? '✅ SUCCESS' : '❌ FAILED');
    
    // Test 5: Update user with fresh hash
    console.log('\n🔄 Updating user with fresh hash...');
    await MultiTenantUser.findByIdAndUpdate(user._id, {
      password: newHash,
      'security.failedLoginAttempts': 0,
      'security.lockedUntil': undefined
    });
    
    // Test the updated user
    const updatedUser = await MultiTenantUser.findById(user._id);
    const finalTest = await bcrypt.compare(testPassword, updatedUser.password);
    console.log('   Updated user test:', finalTest ? '✅ SUCCESS' : '❌ FAILED');
    
    console.log('\n🎉 Password testing complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

testPasswordUtils();