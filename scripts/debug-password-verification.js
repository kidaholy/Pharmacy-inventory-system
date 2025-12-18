const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function debugPasswordVerification() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    
    // Get the user we're trying to login with
    const user = await MultiTenantUser.findOne({ email: 'sosi@sosi.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User found:', {
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });
    
    // Test password verification
    const testPassword = 'password123';
    console.log('🔐 Testing password:', testPassword);
    
    try {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('✅ Password verification result:', isValid);
      
      if (!isValid) {
        console.log('❌ Password does not match. Let\'s try to reset it...');
        
        // Hash the password with the same method as PasswordUtils
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        
        // Update the user's password
        await MultiTenantUser.findByIdAndUpdate(user._id, {
          password: hashedPassword,
          'security.lastPasswordChange': new Date(),
          'security.failedLoginAttempts': 0,
          'security.lockedUntil': undefined
        });
        
        console.log('✅ Password reset successfully');
        
        // Verify the new password
        const newUser = await MultiTenantUser.findById(user._id);
        const newIsValid = await bcrypt.compare(testPassword, newUser.password);
        console.log('✅ New password verification result:', newIsValid);
      }
      
    } catch (error) {
      console.error('❌ Error during password verification:', error);
    }
    
    // Also check the other user
    console.log('\n--- Checking second user ---');
    const user2 = await MultiTenantUser.findOne({ email: 'eyob@gmail.com' });
    
    if (user2) {
      console.log('👤 User 2 found:', {
        email: user2.email,
        role: user2.role,
        tenantId: user2.tenantId,
        isActive: user2.isActive,
        hasPassword: !!user2.password
      });
      
      const isValid2 = await bcrypt.compare(testPassword, user2.password);
      console.log('🔐 User 2 password verification result:', isValid2);
      
      if (!isValid2) {
        console.log('❌ User 2 password does not match. Resetting...');
        
        const hashedPassword2 = await bcrypt.hash(testPassword, 12);
        await MultiTenantUser.findByIdAndUpdate(user2._id, {
          password: hashedPassword2,
          'security.lastPasswordChange': new Date(),
          'security.failedLoginAttempts': 0,
          'security.lockedUntil': undefined
        });
        
        console.log('✅ User 2 password reset successfully');
      }
    }
    
    console.log('\n🎉 Password debugging complete!');
    console.log('🔐 Both users should now be able to login with: password123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

debugPasswordVerification();