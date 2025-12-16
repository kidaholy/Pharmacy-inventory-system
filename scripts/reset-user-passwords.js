const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function resetUserPasswords() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    
    // Reset passwords for all users to 'password123'
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log('🔐 Resetting passwords for all users...');
    
    // Get all users
    const users = await MultiTenantUser.find({});
    
    for (const user of users) {
      await MultiTenantUser.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        'security.lastPasswordChange': new Date(),
        'security.failedLoginAttempts': 0,
        'security.lockedUntil': undefined
      });
      
      console.log(`✅ Reset password for: ${user.email} (${user.role})`);
    }
    
    console.log('');
    console.log('🎉 Password reset complete!');
    console.log('');
    console.log('🔐 Login Credentials (all users now use the same password):');
    console.log('   Password: password123');
    console.log('');
    console.log('👥 Available Users:');
    
    for (const user of users) {
      console.log(`   📧 ${user.email} (${user.role})`);
      if (user.role === 'super_admin') {
        console.log('      → Access: Super Admin Dashboard');
      } else {
        // Find tenant for this user
        const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
        const tenant = await Tenant.findById(user.tenantId);
        if (tenant) {
          console.log(`      → Access: https://pharmacy-inventory-system-gilt.vercel.app/${tenant.subdomain}/dashboard`);
        }
      }
    }
    
    console.log('');
    console.log('🌐 You can now login at: https://pharmacy-inventory-system-gilt.vercel.app/login');
    
  } catch (error) {
    console.error('❌ Error resetting passwords:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

resetUserPasswords();