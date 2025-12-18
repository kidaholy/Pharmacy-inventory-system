const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function resetFailedAttempts() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    
    // Reset failed attempts for all users
    const result = await MultiTenantUser.updateMany(
      {},
      {
        $set: {
          'security.failedLoginAttempts': 0,
          'security.lockedUntil': undefined
        }
      }
    );
    
    console.log('✅ Reset failed attempts for', result.modifiedCount, 'users');
    
    // Check the specific user
    const user = await MultiTenantUser.findOne({ email: 'sosi@sosi.com' });
    console.log('👤 sosi@sosi.com security status:');
    console.log('   Failed attempts:', user.security.failedLoginAttempts);
    console.log('   Locked until:', user.security.lockedUntil || 'Not locked');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

resetFailedAttempts();